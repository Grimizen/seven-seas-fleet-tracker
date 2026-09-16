import {refit} from '../dist/weapons.js';
import {fromCatalogue} from '../dist/cargo-catalogue.js';
import {readFile} from 'node:fs/promises';
import {test,before,after} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,updateDoc,runTransaction,serverTimestamp} from 'firebase/firestore';
import {defaultSharedShip,changeShip,transferCargo,packShip,unpackShip} from '../dist/shared-model.js';
import {templates,reclassify} from '../dist/templates.js';
let env;
const base='campaigns/seven-seas';
before(async()=>{
  env=await initializeTestEnvironment({projectId:'demo-seven-seas',firestore:{rules:await readFile('firestore.rules','utf8')}});
  await env.withSecurityRulesDisabled(async c=>{
    const db=c.firestore();
    for(const [uid,role] of [['owner','owner'],['gm','admin'],['player','member']])await setDoc(doc(db,base,'members',uid),{role});
    await setDoc(doc(db,base,'ships','sea-wren'),defaultSharedShip());
  });
});
after(async()=>{await env?.cleanup();});
test('GM class changes and archives preserve owner access; players cannot configure or edit archives',async()=>{
  const db=dbFor('gm'),ref=doc(db,base,'ships','archive-test');
  const original=defaultSharedShip();original.config.id='archive-test';
  await assertSucceeds(setDoc(ref,reclassify({...original,revision:-1},templates[0])));
  const playerRef=doc(dbFor('player'),base,'ships','archive-test');
  await assertSucceeds(updateDoc(playerRef,{'game.hull':9}));
  await assertFails(updateDoc(playerRef,{'config.archived':true}));
  await assertSucceeds(updateDoc(ref,{'config.archived':true}));
  await assertFails(updateDoc(playerRef,{'game.hull':8}));
  await assertFails(updateDoc(playerRef,{'config.archived':false}));
  await assertSucceeds(updateDoc(ref,{'config.archived':false}));
  await assertSucceeds(updateDoc(playerRef,{'game.hull':8}));
  const owner=await getDoc(doc(dbFor('owner'),base,'members','owner'));
  if(owner.data().role!=='owner')throw Error('Ownership changed.');
  const settings=doc(db,base,'settings','templates');
  await assertSucceeds(setDoc(settings,{items:[templates[0]]}));
  await assertFails(setDoc(doc(dbFor('player'),base,'settings','templates'),{items:[]}));
});
const dbFor=(uid,verified=true)=>env.authenticatedContext(uid,{email:`${uid}@example.com`,email_verified:verified}).firestore();
test('anonymous, unverified, and uninvited accounts cannot read ships',async()=>{
  for(const db of [env.unauthenticatedContext().firestore(),dbFor('stranger'),dbFor('player',false)])await assertFails(getDoc(doc(db,base,'ships','sea-wren')));
});
test('member may read own missing membership for onboarding but cannot appoint self owner',async()=>{
  const db=dbFor('new-person'),ref=doc(db,base,'members','new-person');
  await assertSucceeds(getDoc(ref));await assertFails(setDoc(ref,{role:'owner'}));
});
test('players can apply gameplay actions but cannot edit configuration, create vessels, or invite',async()=>{
  const db=dbFor('player'),ref=doc(db,base,'ships','sea-wren');
  const snapshot=await getDoc(ref),next=changeShip(snapshot.data(),{type:'hp',id:'Hull',amount:-1});
  await assertSucceeds(setDoc(ref,next));
  await assertFails(updateDoc(ref,{'config.name':'Hijacked',revision:next.revision+1}));
  const fresh=defaultSharedShip();fresh.config.id='unauthorised';
  await assertFails(setDoc(doc(db,base,'ships','unauthorised'),fresh));
  await assertFails(setDoc(doc(db,base,'invites','stranger@example.com'),{role:'admin'}));
  await assertFails(updateDoc(doc(db,base,'members','player'),{role:'owner'}));
});
test('GM can create ships and invite verified email accounts; invites cannot create owners',async()=>{
  const db=dbFor('gm'),fresh=defaultSharedShip();fresh.config.id='gm-ship';
  await assertSucceeds(setDoc(doc(db,base,'ships','gm-ship'),fresh));
  await assertSucceeds(setDoc(doc(db,base,'invites','invited@example.com'),{role:'member'}));
  await assertFails(setDoc(doc(db,base,'invites','evil@example.com'),{role:'owner'}));
  const invited=dbFor('invited'),membership=doc(invited,base,'members','invited');
  await assertFails(setDoc(membership,{role:'admin',email:'invited@example.com',displayName:'Test'}));
  await assertSucceeds(setDoc(membership,{role:'member',email:'invited@example.com',displayName:'Test'}));
  await assertFails(setDoc(doc(dbFor('other'),base,'members','other'),{role:'member',email:'invited@example.com',displayName:'Test'}));
});
test('transactions preserve both independent HP changes',async()=>{
  const act=uid=>{const db=dbFor(uid);return runTransaction(db,async tx=>{const ref=doc(db,base,'ships','gm-ship'),old=await tx.get(ref);tx.set(ref,changeShip(old.data(),{type:'hp',id:'Hull',amount:-1}));});};
  await Promise.all([act('player'),act('gm')]);
  const result=await getDoc(doc(dbFor('player'),base,'ships','gm-ship'));
  if(result.data().game.hull!==18)throw Error('Concurrent update was lost.');
});
test('owner can revoke membership; GM cannot promote an owner or edit another membership',async()=>{
  await assertFails(updateDoc(doc(dbFor('gm'),base,'members','player'),{role:'admin'}));
  await assertSucceeds(updateDoc(doc(dbFor('owner'),base,'members','invited'),{role:'revoked'}));
  await assertFails(getDoc(doc(dbFor('invited'),base,'ships','sea-wren')));
});
test('cargo transfer and authenticated activity commit atomically',async()=>{
  const db=dbFor('player'),a=doc(db,base,'ships','sea-wren'),b=doc(db,base,'ships','gm-ship');
  const initialA=(await getDoc(a)).data().game.inventory[0].quantity,initialB=(await getDoc(b)).data().game.inventory[0].quantity;
  await assertSucceeds(runTransaction(db,async tx=>{
    const oldA=await tx.get(a),oldB=await tx.get(b),[nextA,nextB]=transferCargo(oldA.data(),oldB.data(),'lead',3,'test-transfer');
    tx.set(a,nextA);tx.set(b,nextB);tx.set(doc(db,base,'activity','transfer-test'),{actor:'player',text:'Moved three rounds',at:serverTimestamp()});
  }));
  if((await getDoc(a)).data().game.inventory[0].quantity!==initialA-3||(await getDoc(b)).data().game.inventory[0].quantity!==initialB+3)throw Error('Transfer was not conserved.');
  await assertFails(setDoc(doc(db,base,'activity','forged-actor'),{actor:'owner',text:'Forged actor',at:serverTimestamp()}));
});

test('GM may install and remove cannons; players may fire but cannot alter the installed type',async()=>{
  const gm=dbFor('gm'),ref=doc(gm,base,'ships','loadout-test');
  const original=defaultSharedShip();original.config.id='loadout-test';
  const initial=packShip(refit(unpackShip(original),'bow-1','swivel-3'));
  await assertSucceeds(setDoc(ref,initial));
  const playerRef=doc(dbFor('player'),base,'ships','loadout-test');
  const gunId=initial.config.mounts.find(g=>g.slotId==='bow-1').id;
  const loaded=changeShip(initial,{type:'reload',id:gunId,ammo:'lead'});
  await assertSucceeds(setDoc(playerRef,loaded));
  await assertSucceeds(setDoc(playerRef,changeShip(loaded,{type:'fire',id:gunId})));
  const replaced=packShip(refit(unpackShip(loaded),'bow-1','long-9'));
  await assertFails(setDoc(playerRef,replaced));
  await assertSucceeds(setDoc(ref,replaced));
  const removed=packShip(refit(unpackShip(replaced),'bow-1',''));
  await assertSucceeds(setDoc(ref,removed));
});
test('GM may remove a saved template entry; players cannot read or change template settings',async()=>{
  const ref=doc(dbFor('gm'),base,'settings','templates');
  await assertSucceeds(setDoc(ref,{items:[]}));
  await assertFails(getDoc(doc(dbFor('player'),base,'settings','templates')));
  await assertFails(setDoc(doc(dbFor('player'),base,'settings','templates'),{items:[]}));
});

test('load metadata and casualties work under existing permissions without changing ownership',async()=>{
  const ref=doc(dbFor('gm'),base,'ships','weight-test'),original=defaultSharedShip();original.config.id='weight-test';
  original.config.capacityUnits=500;original.config.mounts[0].cargoUnits=9;
  original.game.guns[0].assigned=3;
  await assertSucceeds(setDoc(ref,original));
  const playerRef=doc(dbFor('player'),base,'ships','weight-test');
  let next=changeShip(original,{type:'edit-item',id:'lead',name:'Lead shot - light',category:'Ammunition',cargoUnits:1/16,quantityUnit:'item'});
  next=changeShip(next,{type:'loaded-weight',id:'gun-1',cargo:{name:'Lead shot - light',cargoUnits:1/16}});
  next=changeShip(next,{type:'crew-loss',losses:[{target:'gun:gun-1',amount:2}]});
  await assertSucceeds(setDoc(playerRef,next));
  const saved=(await getDoc(playerRef)).data();
  if(saved.game.crew!==14||saved.game.guns[0].assigned!==1)throw Error('Casualty update incomplete');
  await assertFails(updateDoc(playerRef,{'config.capacityUnits':999}));
  const mounts=structuredClone(saved.config.mounts);mounts[0].cargoUnits=0;
  await assertFails(updateDoc(playerRef,{'config.mounts':mounts}));
  await assertSucceeds(updateDoc(ref,{'config.capacityUnits':null}));
});

test('players may classify legacy cargo and transfer fractional bulk with catalogue metadata',async()=>{
  const gm=dbFor('gm'),a=defaultSharedShip(),b=defaultSharedShip();a.config.id='bulk-a';b.config.id='bulk-b';
  a.game.inventory=[{id:'silk',...fromCatalogue('bulk-silk'),quantity:2.5},{id:'legacy',name:'Lead shot',category:'Ammunition',quantity:26,unitWeight:9}];
  await assertSucceeds(setDoc(doc(gm,base,'ships','bulk-a'),a));await assertSucceeds(setDoc(doc(gm,base,'ships','bulk-b'),b));
  const db=dbFor('player'),ar=doc(db,base,'ships','bulk-a'),br=doc(db,base,'ships','bulk-b');
  const classified=changeShip(a,{type:'edit-item',id:'legacy',...fromCatalogue('shot-lead-light')});
  await assertSucceeds(setDoc(ar,classified));
  await assertSucceeds(runTransaction(db,async tx=>{const x=await tx.get(ar),y=await tx.get(br),[nextA,nextB]=transferCargo(x.data(),y.data(),'silk',.75,'moved');tx.set(ar,nextA);tx.set(br,nextB);}));
  const saved=(await getDoc(ar)).data().game.inventory,received=(await getDoc(br)).data().game.inventory;
  if(saved.find(v=>v.id==='silk').quantity!==1.75||received.find(v=>v.id==='moved').marketValue!==2500||saved.find(v=>v.id==='legacy').unitWeight!==9)throw Error('Cargo data was lost');
  await assertFails(updateDoc(ar,{'config.capacityUnits':999}));
});
