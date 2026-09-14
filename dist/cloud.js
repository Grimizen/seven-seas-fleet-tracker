import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut,updateProfile} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import {getFirestore,doc,collection,onSnapshot,runTransaction,setDoc,getDoc,query,orderBy,limit,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
import {changeShip,transferCargo,changes,undoChanges,defaultSharedShip,packShip,unpackShip} from './shared-model.js';
import {newShip} from './model.js';

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
      if(user?.uid!==actor)throw Error('Your account changed. Try again.');
      after.forEach((value,i)=>tx.set(shipRef(ids[i]),value));activity(tx,op,text);
      return {ids,actor,patches:before.map((d,i)=>changes(d.game,after[i].game)),text};
    });
  }
  return {
    login:()=>signInWithPopup(auth,new GoogleAuthProvider()),logout:()=>signOut(auth),
    profile:async name=>{if(!user)throw Error('Sign in first.');await updateProfile(user,{displayName:name});callbacks.identity(user);},
    change:(id,action,text,expected)=>transact([id],([value])=>[changeShip(value,action,expected)],text),
    transfer:(from,to,item,amount,text)=>{if(from===to)throw Error('Choose a different vessel.');const newId=crypto.randomUUID();return transact([from,to],([a,b])=>transferCargo(a,b,item,amount,newId),text);},
    undo:receipt=>{if(receipt.actor!==user?.uid)throw Error('You can only undo your own actions.');return transact(receipt.ids,docs=>docs.map((d,i)=>({...d,game:undoChanges(d.game,receipt.patches[i]),revision:d.revision+1})),`Undid: ${receipt.text}`);},
    addShip:async(name,id=crypto.randomUUID())=>{requireAdmin();const value=id==='sea-wren'?defaultSharedShip():packShip(newShip(id,name));value.config.name=name;
      await runTransaction(db,async tx=>{const ref=shipRef(id),existing=await tx.get(ref);if(existing.exists())throw Error('This vessel already exists.');tx.set(ref,value);activity(tx,crypto.randomUUID(),`Added vessel ${name}`);});return id;},
    renameShip:async(id,name)=>{requireAdmin();await runTransaction(db,async tx=>{const ref=shipRef(id),snapshot=await tx.get(ref);if(!snapshot.exists())throw Error('Vessel not found.');const value=snapshot.data();tx.update(ref,{config:{...value.config,name},revision:value.revision+1});activity(tx,crypto.randomUUID(),`Renamed vessel to ${name}`);});},
    invite:async(email,access)=>{requireAdmin();if(!['admin','member'].includes(access))throw Error('Choose a valid role.');await setDoc(doc(db,base,'invites',email.trim().toLowerCase()),{role:access});}
  };
}
