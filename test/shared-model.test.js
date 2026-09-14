import test from 'node:test';
import assert from 'node:assert/strict';
import {newShip} from '../dist/model.js';
import {packShip,unpackShip,changeShip,transferCargo,changes,undoChanges} from '../dist/shared-model.js';
test('shared representation preserves ship and separates immutable configuration',()=>{
  const s=newShip();assert.deepEqual(unpackShip(packShip(s)),s);
  const original=packShip(s),next=changeShip(original,{type:'hp',id:'Hull',amount:-3});
  assert.deepEqual(next.config,original.config);assert.equal(next.game.hull,17);assert.equal(next.revision,1);
});
test('retrying a concurrent shot against fresh state rejects the second shot',()=>{
  const original=packShip(newShip()),next=changeShip(original,{type:'fire',id:'gun-1'});
  assert.throws(()=>changeShip(next,{type:'fire',id:'gun-1'}),/not ready/);
});
test('stale absolute edits are rejected',()=>{
  const newer=changeShip(packShip(newShip()),{type:'crew',amount:15},16);
  assert.throws(()=>changeShip(newer,{type:'crew',amount:14},16),/Another player/);
});
test('transfers conserve cargo and leave original documents untouched',()=>{
  const a=packShip(newShip()),b=packShip(newShip('other','Other'));
  const [nextA,nextB]=transferCargo(a,b,'lead',10,'transfer');
  assert.equal(nextA.game.inventory[0].quantity,16);assert.equal(nextB.game.inventory[0].quantity,36);
  assert.equal(a.game.inventory[0].quantity,26);assert.equal(nextA.revision,1);
  assert.throws(()=>transferCargo(a,b,'lead',27,'transfer'));
});
test('undo preserves unrelated later changes and rejects conflicting changes',()=>{
  const original=packShip(newShip()),shot=changeShip(original,{type:'fire',id:'gun-1'});
  const patch=changes(original.game,shot.game);
  const damaged=changeShip(shot,{type:'hp',id:'Hull',amount:-1});
  const restored=undoChanges(damaged.game,patch);assert.equal(restored.hull,19);assert.equal(restored.guns[0].loaded,'Lead shot');
  const otherShot=changeShip(shot,{type:'fire',id:'gun-2'});
  assert.throws(()=>undoChanges(otherShot.game,patch),/another change/);
});
test('undo accepts Firestore map key reordering within arrays',()=>{
  const before={guns:[{condition:'operational',loaded:'Lead shot',assigned:0}]};
  const after={guns:[{condition:'operational',loaded:null,assigned:0}]};
  const roundTrip={guns:[{assigned:0,condition:'operational',loaded:null}]};
  assert.deepEqual(undoChanges(roundTrip,changes(before,after)),before);
});
