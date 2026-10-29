import test from 'node:test';
import assert from 'node:assert/strict';
import {newShip,apply} from '../dist/model.js';
import {provisionPlan,provisionSnapshot,rationRate} from '../dist/provisions.js';
import {packShip,changeShip,changes,undoChanges} from '../dist/shared-model.js';
import {actionMessage} from '../dist/action-log.js';
import {filledOfficerCount,provisionsPanel} from '../dist/provisions.js';
const vessel=()=>{const s=newShip();s.crew=22;s.inventory.push({id:'food',name:'Daily rations',category:'Rations',quantity:100,cargoUnits:1/30});return s;};
const action={type:'daily-rations',exempt:1,extra:0,caught:10,stock:'food',day:'Voyage 7'};
test('15 general crew and seven filled officer slots consume 21 rations after one exemption',()=>{
  const s=vessel();s.crew=15;
  Object.keys(s.officers).slice(0,7).forEach((role,i)=>s.officers[role]='Officer '+i);
  const a={...action,caught:0},p=provisionPlan(s,a);
  assert.equal(p.officers,7);assert.equal(p.people,21);assert.equal(p.rations,21);
  assert.equal(apply(s,a).inventory[1].quantity,79);
  assert.equal(provisionPlan(s,action).rations,11);
  assert.match(provisionsPanel(s,x=>x),/15 general crew \+ 7 filled officer roles/);
  assert.match(actionMessage(s,a),/15 general crew \+ 7 officers \+ 0 extra people − 1 exempt/);
});
test('officer slots ignore blank names, count each occupied slot and allow officer/guest exemptions',()=>{
  const s=vessel();s.crew=0;s.officers={Captain:'Ada',Gunner:'Ada',Cook:'  ',Navigator:''};
  assert.equal(filledOfficerCount(s),2);
  assert.equal(provisionPlan(s,{...action,caught:0,exempt:2}).rations,0);
  assert.equal(provisionPlan(s,{...action,caught:0,extra:1,exempt:3}).rations,0);
  assert.throws(()=>provisionPlan(s,{...action,exempt:3}),/Non-consuming/);
});
test('changes to filled officer count reject a stale ration preview',()=>{
  const s=vessel(),before=packShip(s),expected=provisionSnapshot(s,action);
  const occupied=changeShip(before,{type:'officer',id:'Captain',value:'Ada'});
  assert.throws(()=>changeShip(occupied,action,expected),/Another player/);
  const latest=provisionSnapshot({...s,officers:{...s.officers,Captain:'Ada'}},action);
  const renamed=changeShip(occupied,{type:'officer',id:'Captain',value:'Bea'});
  assert.equal(changeShip(renamed,action,latest).game.inventory[1].quantity,88);
});
test('22 crew minus one exempt and ten fish uses eleven rations, with complete undo',()=>{
  const s=vessel(),before=packShip(s),after=changeShip(before,action,provisionSnapshot(s,action));
  assert.equal(provisionPlan(s,action).rations,11);assert.equal(after.game.inventory[1].quantity,89);
  assert.equal(s.inventory[1].quantity,100);assert.equal(after.game.crew,22);
  assert.deepEqual(after.config,before.config);assert.deepEqual(undoChanges(after.game,changes(before.game,after.game)),before.game);
  assert.match(actionMessage(s,action),/22 general crew \+ 0 officers \+ 0 extra people − 1 exempt − 10 catch = 11 stored rations used from Daily rations/);
});
test('extra mouths, no catch, excess catch and zero crew are handled without adding food',()=>{
  const s=vessel();assert.equal(provisionPlan(s,{...action,extra:6,caught:0}).rations,27);
  const a={...action,caught:30,stock:''},p=provisionPlan(s,a);assert.equal(p.rations,0);assert.equal(p.surplus,9);assert.deepEqual(apply(s,a),s);
  s.crew=0;assert.equal(provisionPlan(s,{...action,exempt:0,caught:0}).rations,0);
});
test('bulk rations use confirmed CU conversion and preserve item metadata',()=>{
  const s=vessel();Object.assign(s.inventory[1],{catalogId:'bulk-ration-bulk',quantityUnit:'cargo unit',quantity:2,cargoUnits:1});
  const next=apply(s,action);assert.ok(Math.abs(next.inventory[1].quantity-(2-11/30))<1e-12);
  assert.equal(next.inventory[1].cargoUnits,1);assert.equal(rationRate({category:'Rations',catalogId:'food-items'}),0);
  assert.equal(rationRate({category:'Rations',quantityUnit:'cargo unit'}),0);assert.equal(rationRate({category:'Rations',personal:true}),0);
});
test('invalid inputs and insufficient stock reject without partial deductions',()=>{
  const s=vessel();s.inventory[1].quantity=10;assert.throws(()=>apply(s,action),/Not enough/);assert.equal(s.inventory[1].quantity,10);
  for(const a of [{exempt:23},{exempt:-1},{caught:-1},{caught:1.5},{extra:NaN},{stock:'lead'}])assert.throws(()=>apply(vessel(),{...action,...a}));
  s.inventory[1].quantity=11;assert.equal(apply(s,action).inventory[1].quantity,0);
});
test('stale crew or ration edits are rejected, including a concurrent daily deduction',()=>{
  const s=vessel(),before=packShip(s),expected=provisionSnapshot(s,action),after=changeShip(before,action,expected);
  assert.throws(()=>changeShip(after,action,expected),/Another player/);
  assert.throws(()=>changeShip(changeShip(before,{type:'crew',amount:21}),action,expected),/Another player/);
  const hull=changeShip(before,{type:'hp',id:'Hull',amount:-1});assert.equal(changeShip(hull,action,expected).game.hull,19);
});

 test('officer occupancy follows saved assignments, clearing, renaming and reload',()=>{
 let doc=packShip(vessel());
 for(const role of ['Captain','Cook','Gunner'])doc=changeShip(doc,{type:'officer',id:role,value:'Assigned (unnamed)'});
 assert.equal(filledOfficerCount(doc.game),3);
 doc=changeShip(doc,{type:'officer',id:'Captain',value:'Ada'});
 assert.equal(filledOfficerCount(doc.game),3);
 doc=changeShip(doc,{type:'officer',id:'Cook',value:''});
 const reloaded=JSON.parse(JSON.stringify(doc));
 assert.equal(filledOfficerCount(reloaded.game),2);
 assert.equal(provisionPlan({...vessel(),...reloaded.game}, {...action,caught:0}).rations,23);
 });
