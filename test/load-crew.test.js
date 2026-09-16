import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newShip,apply,assigned} from '../dist/model.js';
import {loadState,weight} from '../dist/load.js';
import {packShip,unpackShip,changeShip,transferCargo,changes,undoChanges} from '../dist/shared-model.js';
import {refit,moveGun,loadoutSignature} from '../dist/weapons.js';
import {actionSound} from '../dist/sound-events.js';
import {actionMessage} from '../dist/action-log.js';
import {templates,createFromTemplate} from '../dist/templates.js';

const weighed=()=>newShip();
test('load uses GM cargo formulas, cargo quantity and separately loaded rounds',()=>{
  const s=weighed(),l=loadState(s);assert.equal(l.known,37.875);assert.equal(l.remaining,112.125);assert.deepEqual(l.missing,[]);
  s.guns[0].cargoUnits=100;assert.equal(loadState(s).known,128.875);
  s.capacityUnits=0;assert.equal(loadState(s).over,true);
  assert.deepEqual(unpackShip(packShip(s)),s);
});
test('legacy unknown weights are incomplete, never silently treated as complete zero load',()=>{
  const legacy=newShip();delete legacy.capacityUnits;legacy.type='Custom';delete legacy.inventory[0].cargoUnits;legacy.guns.forEach(g=>delete g.loadedCargo);const l=loadState(legacy);assert.equal(l.known,36);assert.equal(l.capacity,null);assert.equal(l.remaining,null);assert.equal(l.missing.length,5);
  for(const bad of [-1,NaN,Infinity,'9',undefined])assert.throws(()=>weight(bad));
  assert.equal(weight(null,true),null);assert.equal(weight(0),0);
});
test('reload and refit conserve weight; firing removes only the loaded round weight',()=>{
  const s=weighed(),fired=apply(s,{type:'fire',id:'gun-1'});assert.equal(loadState(fired).known,37.8125);
  const loaded=apply(fired,{type:'reload',id:'gun-1',ammo:'lead'});assert.equal(loadState(loaded).known,37.8125);
  const removed=refit(loaded,'port-1','');assert.equal(loadState(removed).known,28.8125);
  assert.equal(removed.inventory[0].quantity,26);
  const moved=moveGun(s,'port-1','port-3');assert.equal(loadState(moved).known,37.875);
});
test('transfer preserves different unit weights as separate rows and conserves combined load',()=>{
  const a=weighed(),b=weighed();b.id='other';b.inventory[0].cargoUnits=2;
  const total=loadState(a).known+loadState(b).known;
  const [x,y]=transferCargo(packShip(a),packShip(b),'lead',26,'new');
  assert.equal(x.game.inventory.length,0);assert.equal(y.game.inventory.length,2);
  assert.equal(loadState(unpackShip(x)).known+loadState(unpackShip(y)).known,total);
});
test('cargo weight edits reject stale values; loaded round edits reject a changed round',()=>{
  const d=packShip(weighed()),a={type:'edit-item',id:'lead',name:'Lead shot - light',category:'Ammunition',cargoUnits:8,quantityUnit:'item'};
  const next=changeShip(d,a,d.game.inventory[0]);assert.equal(next.game.inventory[0].cargoUnits,8);
  assert.throws(()=>changeShip(next,a,d.game.inventory[0]),/Another player/);
  const shot={type:'loaded-weight',id:'gun-1',cargo:{name:'Lead shot - light',cargoUnits:2,quantityUnit:'item'}};
  assert.throws(()=>changeShip(d,shot,{loaded:'Chain shot',weight:9}),/Another player/);
  assert.equal(changeShip(d,shot,{loaded:'Lead shot - light',weight:null,cargo:d.game.guns[0].loadedCargo}).game.guns[0].loadedCargo.cargoUnits,2);
});
test('casualties remove only explicitly chosen cohorts, with total and assignments kept consistent',()=>{
  const s=weighed();s.stations.Hold.assigned=3;s.guns[0].assigned=4;s.officers.Captain='PC';
  const next=apply(s,{type:'crew-loss',losses:[{target:'station:Hold',amount:2},{target:'gun:gun-1',amount:1},{target:'unassigned',amount:2}]});
  assert.equal(next.crew,11);assert.equal(assigned(next),4);assert.equal(next.stations.Hold.assigned,1);assert.equal(next.guns[0].assigned,3);
  assert.equal(next.hull,s.hull);assert.deepEqual(next.officers,s.officers);assert.equal(s.crew,16);
  const before=packShip(s).game,after=packShip(next).game;assert.deepEqual(undoChanges(after,changes(before,after)),before);
  for(const losses of [[],[{target:'station:Hold',amount:4}],[{target:'unassigned',amount:10}],[{target:'gun:missing',amount:1}],[{target:'unassigned',amount:1.5}],[{target:'unassigned',amount:1},{target:'unassigned',amount:1}]])assert.throws(()=>apply(s,{type:'crew-loss',losses}));
});
test('ending sinking requires restored hull and an unchanged countdown; repair alone keeps it',()=>{
  const s=weighed();s.hull=0;s.sinking=3;assert.throws(()=>apply(s,{type:'end-sinking'}));
  const repaired=apply(s,{type:'hp',id:'Hull',amount:1});assert.equal(repaired.sinking,3);
  const d=packShip(repaired);assert.throws(()=>changeShip(d,{type:'end-sinking'},2),/Another player/);
  assert.equal(changeShip(d,{type:'end-sinking'},3).game.sinking,null);
});
test('capacity flows through templates and gun weight changes invalidate stale loadouts',()=>{
  const s=createFromTemplate('x','Test',{...templates[2],capacityUnits:123});assert.equal(s.capacityUnits,123);
  const old=loadoutSignature(s);s.guns[0].cargoUnits=10;assert.notEqual(loadoutSignature(s),old);
});
test('sound events ignore no-ops and repairs; log labels use visible assignments',()=>{
  const s=newShip();assert.equal(actionSound({type:'fire'},s,false),null);
  assert.equal(actionSound({type:'sails',amount:s.sails},s),null);
  assert.equal(actionSound({type:'hp',id:'Hull',amount:1},s),null);
  assert.equal(actionSound({type:'hp',id:'Hull',amount:-1},s),'damage');
  assert.equal(actionMessage(s,{type:'assign',id:'gun-1',amount:2}),'Sea Wren: Port 1: assigned crew 2');
  assert.equal(actionMessage(s,{type:'hp'},'Sea Wren: Damaged Hull'),'Sea Wren: Damaged Hull');
});
