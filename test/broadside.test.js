import test from 'node:test';
import assert from 'node:assert/strict';
import {newShip,apply} from '../dist/model.js';
import {packShip,unpackShip,changeShip,changes,undoChanges} from '../dist/shared-model.js';
import {broadsidePlan,broadsideSnapshot,broadsideControls} from '../dist/broadside.js';
import {refit} from '../dist/weapons.js';
import {actionMessage} from '../dist/action-log.js';
import {actionSound} from '../dist/sound-events.js';
import {officerEntries,namedOrder} from '../dist/ui-order.js';
import {filteredInventory} from '../dist/cargo.js';
import {crewTargets} from '../dist/crew.js';

const action=(s,mode,side='Port',ammo='lead')=>({type:'broadside-'+mode,side,ammo,ids:broadsidePlan(s,side,mode,ammo).targets.map(v=>v.gun.id)});
test('broadside fires only ready guns on the chosen side, preserves stores and undoes as one action',()=>{
  let s=refit(newShip(),'bow-1','swivel-3');s.guns.at(-1).loaded='Lead shot';s.guns[1].condition='disabled';
  const a=action(s,'fire'),before=packShip(s),after=changeShip(before,a,broadsideSnapshot(s,a));
  assert.equal(after.revision,1);assert.equal(after.game.guns[0].loaded,null);
  assert.deepEqual(after.game.guns.slice(1),before.game.guns.slice(1));
  assert.deepEqual(after.game.inventory,before.game.inventory);
  assert.deepEqual(undoChanges(after.game,changes(before.game,after.game)),before.game);
  assert.match(actionMessage(s,a),/Sea Wren: Fired port broadside \(1 guns\): Port 1/);
  assert.equal(actionSound(a,s),'broadside');assert.equal(actionSound(a,s,false),null);
  assert.throws(()=>apply(unpackShip(after),a),/No ready/);
});
test('batch reload consumes one round per eligible gun, preserves metadata and supports atomic undo',()=>{
  const s=apply(newShip(),action(newShip(),'fire')),a=action(s,'reload'),before=packShip(s),after=changeShip(before,a,broadsideSnapshot(s,a));
  assert.equal(after.game.inventory[0].quantity,24);
  assert.equal(after.game.guns[0].loadedCargo.cargoUnits,1/16);
  assert.equal(after.game.guns[1].loadedCargo.marketValue,4);
  assert.deepEqual(after.game.guns.slice(2),before.game.guns.slice(2));
  assert.deepEqual(undoChanges(after.game,changes(before.game,after.game)),before.game);
  assert.match(actionMessage(s,a),/Reloaded port broadside.*Port 1, Port 2 with Lead shot - light/);
  assert.equal(actionSound(a,s),null);
});
test('insufficient stock, destroyed services and invalid batches never partially apply',()=>{
  const s=apply(newShip(),action(newShip(),'fire'));s.inventory[0].quantity=1;
  const original=structuredClone(s);assert.throws(()=>apply(s,action(s,'reload')),/Need 2/);assert.deepEqual(s,original);
  s.inventory[0].quantity=2;s.stations['Powder Dock'].hp=0;assert.throws(()=>apply(s,action(s,'reload')),/powder dock/);
  s.stations['Powder Dock'].hp=1;s.stations['Gun Deck'].hp=0;assert.throws(()=>apply(s,action(s,'reload')),/gun deck/);
  assert.throws(()=>apply(s,action(s,'fire','Starboard')),/gun deck/);
  assert.throws(()=>broadsidePlan(s,'Bow','fire'),/port or starboard/);
  const ready=newShip();assert.throws(()=>apply(ready,{...action(ready,'fire'),ids:['gun-1']}),/changed/);
});
test('mixed broadside reload skips loaded, disabled and incompatible guns without blocking eligible guns',()=>{
  let s=refit(newShip(),'port-2','swivel-3');s.guns[0].loaded=null;
  s.inventory.push({id:'chain',name:'Chain shot',category:'Ammunition',quantity:5,shotType:'chain',cargoUnits:1/16});
  const p=broadsidePlan(s,'Port','reload','chain');assert.deepEqual(p.targets.map(v=>v.name),['Port 1']);
  const next=apply(s,action(s,'reload','Port','chain'));assert.equal(next.inventory.at(-1).quantity,4);
  assert.equal(next.guns.find(g=>g.slotId==='port-2').loaded,null);
  assert.equal(broadsidePlan(next,'Port','reload','lead').targets.length,1);
});
test('concurrent gun or ammunition edits reject stale batches; unrelated edits are retained',()=>{
  const s=newShip(),a=action(s,'fire'),expected=broadsideSnapshot(s,a),doc=packShip(s);
  const fired=changeShip(doc,{type:'fire',id:'gun-1'});
  assert.throws(()=>changeShip(fired,a,expected),/Another player/);
  const damaged=changeShip(doc,{type:'hp',id:'Hull',amount:-1});assert.equal(changeShip(damaged,a,expected).game.hull,s.hull-1);
  const empty=apply(s,a),reload=action(empty,'reload'),before=packShip(empty);
  const edited=structuredClone(before);edited.game.inventory[0].cargoUnits=.5;
  assert.throws(()=>changeShip(edited,reload,broadsideSnapshot(empty,reload)),/Another player/);
  const reloaded=changeShip(before,{type:'reload',id:'gun-1',ammo:'lead'});
  assert.throws(()=>changeShip(reloaded,reload,broadsideSnapshot(empty,reload)),/Another player/);
});
test('UI ordering survives map and array round trips, numeric names and equal labels',()=>{
  const officers={Surgeon:'A',Captain:'B',Bosun:'C'};
  assert.deepEqual(officerEntries(officers),officerEntries(Object.fromEntries(Object.entries(officers).reverse())));
  assert.deepEqual(officerEntries(officers).map(([k])=>k),['Bosun','Captain','Surgeon']);
  const rows=[{id:'b',name:'Ship 10'},{id:'z',name:'Ship 2'},{id:'a',name:'Ship 10'}];
  assert.deepEqual(namedOrder(rows).map(v=>v.id),['z','a','b']);
  const items=rows.map(v=>({...v,quantity:1,category:'Equipment'})),filters={query:'',stock:'all',sort:'quantity'};
  assert.deepEqual(filteredInventory(items,filters),filteredInventory([...items].reverse(),filters));
  let s=refit(newShip(),'port-1','long-12');const targets=crewTargets(s).filter(v=>v.id.startsWith('gun:'));
  assert.deepEqual(targets.map(v=>v.name),['Port 1 gun crew','Port 2 gun crew','Starboard 1 gun crew','Starboard 2 gun crew']);
  assert.match(broadsideControls(s,'Port',v=>v),/Fire port broadside \(1\)/);
});
