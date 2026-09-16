import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut,updateProfile} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import {getFirestore,doc,collection,onSnapshot,runTransaction,setDoc,getDoc,query,orderBy,limit,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import {weight} from './load.js';
import {actionMessage} from './action-log.js';
import {firebaseConfig} from './firebase-config.js';
import {changeShip,transferCargo,changes,undoChanges,defaultSharedShip,packShip,unpackShip,equal} from './shared-model.js';
import {refit,moveGun,validateArmament,loadoutSignature,slotsFor} from './weapons.js';
import {saveTemplateEntry,deleteTemplateEntry} from './template-store.js';
import {reclassify,createFromTemplate,templates} from './templates.js';

export function createCloud(callbacks){
  const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
  const base='campaigns/seven-seas',shipRef=id=>doc(db,base,'ships',id),memberRef=uid=>doc(db,base,'members',uid);
  let user=null,role=null,stops=[],watchMember=null,generation=0;
  function stop(){for(const fn of stops)fn();stops=[];}
  function error(e){callbacks.error(e);}
  onAuthStateChanged(auth,async next=>{
    const version=++generation;stop();watchMember?.();user=next;role=null;callbacks.identity(next);
    if(!next)return;
    // A verified Google account can only claim a membership that an admin invited.
    try {const existing=await getDoc(memberRef(next.uid));
      if(!existing.exists()&&next.emailVerified&&next.email){const email=next.email.toLowerCase();const invited=await getDoc(doc(db,base,'invites',email));
        if(invited.exists())await setDoc(memberRef(next.uid),{role:invited.data().role,email,displayName:next.displayName||'Player'});
      }
    }catch(e){if(version!==generation)return; /* Membership watcher reports setup/rules errors below. */}
    if(version!==generation)return;
    watchMember=onSnapshot(memberRef(next.uid),snap=>{
      stop();role=snap.exists()?snap.data().role:null;callbacks.membership(role);
      if(!['owner','admin','member'].includes(role))return;
      if(['owner','admin'].includes(role))stops.push(onSnapshot(doc(db,base,'settings','templates'),snapshot=>callbacks.templates(snapshot.exists()?snapshot.data().items:[]),e=>callbacks.templateError(e)));
      stops.push(onSnapshot(collection(db,base,'ships'),{includeMetadataChanges:true},snapshot=>{
        callbacks.ships(snapshot.docs.map(d=>unpackShip(d.data())),!snapshot.metadata.fromCache);
      },error));
      stops.push(onSnapshot(query(collection(db,base,'activity'),orderBy('at','desc'),limit(40)),snapshot=>{
        callbacks.log(snapshot.docs.map(d=>({at:d.data().at?.toMillis()||Date.now(),text:d.data().text})));
      },error));
    },error);
  });
  function requireUser(){if(!user||!role)throw Error('Sign in with an approved account first.');if(!navigator.onLine)throw Error('You are offline. Reconnect before making changes.');}
  function requireAdmin(){requireUser();if(!['owner','admin'].includes(role))throw Error('Only the owner and GM can manage vessels.');}
  function activity(tx,id,text){tx.set(doc(db,base,'activity',id),{actor:user.uid,text:`${user.displayName||'Player'} · ${text}`.slice(0,1000),at:serverTimestamp()});}
  async function transact(ids,transform,text){
    requireUser();const actor=user.uid,op=crypto.randomUUID();
    return runTransaction(db,async tx=>{
      const old=await Promise.all(ids.map(id=>tx.get(shipRef(id))));
      if(old.some(s=>!s.exists()))throw Error('This vessel no longer exists.');
      const before=old.map(s=>s.data()),after=transform(before);
      if(before.some(d=>d.config.archived))throw Error('Restore this vessel before changing its gameplay state.');
      if(user?.uid!==actor)throw Error('Your account changed. Try again.');
      after.forEach((value,i)=>tx.set(shipRef(ids[i]),value));activity(tx,op,typeof text==='function'?text(before):text);
      return {ids,actor,loadouts:after.map(d=>loadoutSignature(unpackShip(d))),patches:before.map((d,i)=>changes(d.game,after[i].game)),text:typeof text==='function'?text(before):text};
    });
  }
  async function editLoadout(id,transform,signature,text){requireAdmin();await runTransaction(db,async tx=>{const ref=shipRef(id),snap=await tx.get(ref);if(!snap.exists())throw Error('Vessel not found.');const old=snap.data(),current=unpackShip(old);if(current.archived)throw Error('Restore this vessel first.');if(signature!==loadoutSignature(current))throw Error('The loadout changed. Review it and try again.');const packed=packShip(transform(current));tx.set(ref,{...old,config:{...old.config,...packed.config},game:packed.game,revision:old.revision+1});activity(tx,crypto.randomUUID(),`${old.config.name}: ${typeof text==='function'?text(unpackShip(old)):text}`);});}
  return {
    login:()=>signInWithPopup(auth,new GoogleAuthProvider()),logout:()=>signOut(auth),
    profile:async name=>{if(!user)throw Error('Sign in first.');await updateProfile(user,{displayName:name});callbacks.identity(user);},
    change:(id,action,text,expected,signature)=>transact([id],([value])=>{if(signature&&signature!==loadoutSignature(unpackShip(value)))throw Error('The loadout changed. Review the vessel and try again.');return [changeShip(value,action,expected)];},([value])=>actionMessage(unpackShip(value),action,text)),
    transfer:(from,to,item,amount,text)=>{if(from===to)throw Error('Choose a different vessel.');const newId=crypto.randomUUID();return transact([from,to],([a,b])=>transferCargo(a,b,item,amount,newId),([a,b])=>`Transferred ${amount} ${a.game.inventory.find(i=>i.id===item)?.name??'cargo'} from ${a.config.name} to ${b.config.name}`);},
    undo:receipt=>{if(receipt.actor!==user?.uid)throw Error('You can only undo your own actions.');return transact(receipt.ids,docs=>docs.map((d,i)=>{if(receipt.loadouts&&receipt.loadouts[i]!==loadoutSignature(unpackShip(d)))throw Error('Cannot undo across a loadout change.');return {...d,game:undoChanges(d.game,receipt.patches[i]),revision:d.revision+1};}),`Undid: ${receipt.text}`);},
    addShip:async(name,id=crypto.randomUUID(),template=templates[2])=>{requireAdmin();const value=id==='sea-wren'?defaultSharedShip():packShip(createFromTemplate(id,name,template));value.config.name=name;
      await runTransaction(db,async tx=>{const ref=shipRef(id),existing=await tx.get(ref);if(existing.exists())throw Error('This vessel already exists.');tx.set(ref,value);activity(tx,crypto.randomUUID(),`Added vessel ${name}`);});return id;},
    renameShip:async(id,name)=>{requireAdmin();await runTransaction(db,async tx=>{const ref=shipRef(id),snapshot=await tx.get(ref);if(!snapshot.exists())throw Error('Vessel not found.');const value=snapshot.data();tx.update(ref,{config:{...value.config,name},revision:value.revision+1});activity(tx,crypto.randomUUID(),`Renamed vessel to ${name}`);});},
    configureShip:async(id,template)=>{requireAdmin();await runTransaction(db,async tx=>{const ref=shipRef(id),snapshot=await tx.get(ref);if(!snapshot.exists())throw Error('Vessel not found.');tx.set(ref,reclassify(snapshot.data(),template));activity(tx,crypto.randomUUID(),`Changed ${snapshot.data().config.name} from ${snapshot.data().config.type} to ${template.type}`);});},
    archiveShip:async(id,archived)=>{requireAdmin();await runTransaction(db,async tx=>{const ref=shipRef(id),snapshot=await tx.get(ref);if(!snapshot.exists())throw Error('Vessel not found.');const value=snapshot.data();tx.update(ref,{config:{...value.config,archived},revision:value.revision+1});activity(tx,crypto.randomUUID(),`${archived?'Archived':'Restored'} vessel ${value.config.name}`);});},
    setGunWeight:async(id,gunId,value,signature)=>editLoadout(id,s=>{const g=s.guns.find(g=>g.id===gunId);if(!g)throw Error('Gun no longer installed.');g.cargoUnits=weight(value,true);return s;},signature,s=>`${s.guns.find(g=>g.id===gunId)?.name}: cargo units ${value===null?'GM formula':value+' CU'}`),
    setCapacity:async(id,value,expected)=>{requireAdmin();value=weight(value,true);await runTransaction(db,async tx=>{const ref=shipRef(id),snap=await tx.get(ref);if(!snap.exists())throw Error('Vessel not found.');const old=snap.data();if(old.config.archived)throw Error('Restore this vessel first.');if(!equal({reviewed:Object.hasOwn(old.config,'capacityUnits'),units:old.config.capacityUnits??null,legacy:old.config.maxLoad??null,type:old.config.type},expected))throw Error('Capacity changed. Review the latest value.');tx.update(ref,{config:{...old.config,capacityUnits:value},revision:old.revision+1});activity(tx,crypto.randomUUID(),`${old.config.name}: load capacity ${value===null?'unset':value+' CU'}`);});},
    refit:async(id,slot,type,signature)=>editLoadout(id,s=>refit(s,slot,type),signature,s=>`${slotsFor(s).find(v=>v.id===slot)?.name}: ${type?'installed '+type:'removed cannon'}`),
    moveGun:async(id,from,to,signature)=>editLoadout(id,s=>moveGun(s,from,to),signature,s=>`Moved cannon from ${slotsFor(s).find(v=>v.id===from)?.name} to ${slotsFor(s).find(v=>v.id===to)?.name}`),
    layout:async(id,armament,signature)=>editLoadout(id,s=>{const max=Object.values(armament.layout).reduce((n,v)=>n+v,0);validateArmament(armament,max,s.guns);return {...s,armament,maxGuns:max};},signature,'Updated gun slot layout'),
    saveTemplate:async(template,original=null)=>{requireAdmin();const id=original?.id??crypto.randomUUID();await runTransaction(db,async tx=>{const ref=doc(db,base,'settings','templates'),snap=await tx.get(ref),items=snap.exists()?snap.data().items:[];tx.set(ref,{items:saveTemplateEntry(items,template,original,id)});});},
    deleteTemplate:async original=>{requireAdmin();await runTransaction(db,async tx=>{const ref=doc(db,base,'settings','templates'),snap=await tx.get(ref),items=snap.exists()?snap.data().items:[];tx.set(ref,{items:deleteTemplateEntry(items,original)});});},
    invite:async(email,access)=>{requireAdmin();if(!['admin','member'].includes(access))throw Error('Choose a valid role.');await setDoc(doc(db,base,'invites',email.trim().toLowerCase()),{role:access});}
  };
}
