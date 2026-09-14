import {readFile} from 'node:fs/promises';
import {test,before,after} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,updateDoc,runTransaction} from 'firebase/firestore';
import {defaultSharedShip,changeShip} from '../dist/shared-model.js';
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
