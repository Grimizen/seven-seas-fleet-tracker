import test from 'node:test';
import assert from 'node:assert/strict';
import {newShip,apply,assigned} from '../dist/model.js';
import {catalogue,slotsFor,refit,moveGun,armamentFor,validateArmament,loadoutSignature} from '../dist/weapons.js';
import {packShip,unpackShip,transferCargo,changes,undoChanges} from '../dist/shared-model.js';

test('legacy Sloop exposes all nine slots and preserves four original guns',()=>{
  const s=newShip(),slots=slotsFor(s);
  assert.equal(slots.length,9);assert.equal(slots.filter(v=>v.side==='Bow').length,1);
  assert.equal(slots.filter(v=>v.gun).length,4);assert.equal(slots.find(v=>v.id==='starboard-2').gun.id,'gun-4');
  const asymmetric={...s,maxGuns:1,guns:[s.guns[0]]};assert.equal(slotsFor(asymmetric)[0].gun.id,'gun-1');
});
test('catalogue follows gun tables including minimum range and crew-only swivels',()=>{
  assert.equal(catalogue.length,18);assert.equal(catalogue.find(g=>g.id==='howitzer-18').minRange,12);
  assert.equal(catalogue.find(g=>g.id==='swivel-3').crew,1);assert.equal(catalogue.find(g=>g.id==='long-9').damage,'d4');
});
test('replacing a loaded cannon conserves its shot and releases assigned sailors',()=>{
  const s=newShip();s.guns[0].assigned=3;
  const result=refit(s,'port-1','carronade-12');
  assert.equal(result.inventory[0].quantity,27);assert.equal(result.crew,16);assert.equal(assigned(result),0);
  const gun=slotsFor(result).find(v=>v.id==='port-1').gun;assert.equal(gun.loaded,null);assert.equal(gun.gunType,'carronade-12');
  assert.equal(s.inventory[0].quantity,26);assert.equal(s.guns[0].assigned,3);
  assert.deepEqual(unpackShip(packShip(result)),result);
});
test('moving a cannon preserves state; occupied or forbidden destinations reject',()=>{
  const s=newShip();s.guns[0].condition='disabled';s.guns[0].assigned=2;
  const moved=moveGun(s,'port-1','bow-1'),gun=slotsFor(moved).find(v=>v.id==='bow-1').gun;
  assert.equal(gun.loaded,'Lead shot - light');assert.equal(gun.assigned,2);assert.equal(gun.condition,'disabled');
  assert.throws(()=>moveGun(s,'port-1','starboard-1'),/empty destination/);
  s.armament=armamentFor(s);s.armament.chaseTypes=['Swivel Gun'];
  assert.throws(()=>moveGun(s,'port-1','bow-1'),/not allowed/);
  assert.throws(()=>refit(s,'bow-1','long-9'),/not permitted/);
});
test('slot reductions reject occupied slots; stern slots and family restrictions are configurable',()=>{
  const s=newShip(),a=armamentFor(s);a.layout.Port=1;a.layout.Stern=1;
  assert.throws(()=>validateArmament(a,7,s.guns),/occupied slots/);
  a.layout.Port=4;a.layout.Starboard=3;assert.doesNotThrow(()=>validateArmament(a,9,s.guns));
});
test('swivels reject special shot while long guns can load it',()=>{
  const s=refit(newShip(),'bow-1','swivel-3');s.inventory.push({id:'chain',name:'Chain shot',category:'Ammunition',quantity:2});
  const id=slotsFor(s).find(v=>v.id==='bow-1').gun.id;
  assert.throws(()=>apply(s,{type:'reload',id,ammo:'chain'}),/only load lead/);
  assert.equal(apply(s,{type:'reload',id,ammo:'lead'}).inventory[0].quantity,25);
});
test('full transfer removes source row and undo restores both inventories',()=>{
  const a=packShip(newShip()),b=packShip(newShip('other','Other'));
  const [aa,bb]=transferCargo(a,b,'lead',26,'transfer');assert.equal(aa.game.inventory.length,0);assert.equal(bb.game.inventory[0].quantity,52);
  assert.deepEqual(undoChanges(aa.game,changes(a.game,aa.game)),a.game);
  assert.deepEqual(undoChanges(bb.game,changes(b.game,bb.game)),b.game);
});
test('loadout signature ignores Firestore key ordering but detects refits',()=>{
  const s=newShip();s.armament=armamentFor(s);const reordered=structuredClone(s);reordered.armament.layout={Stern:0,Bow:1,Starboard:4,Port:4};
  assert.equal(loadoutSignature(s),loadoutSignature(reordered));assert.notEqual(loadoutSignature(s),loadoutSignature(refit(s,'port-1','long-12')));
});

test('removing and reinstalling the same gun type invalidates stale loadout actions',()=>{
  const original=refit(newShip(),'bow-1','long-9');
  const replaced=refit(refit(original,'bow-1',''),'bow-1','long-9');
  assert.notEqual(loadoutSignature(original),loadoutSignature(replaced));
});
