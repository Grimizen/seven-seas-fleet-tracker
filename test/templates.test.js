import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultSharedShip,unpackShip,changeShip} from '../dist/shared-model.js';
import {templates,reclassify} from '../dist/templates.js';

test('class change preserves damage, destroyed sections, cargo and crew without mutating input',()=>{
  const old=defaultSharedShip();old.game.hull=17;old.game.stations.Mast.hp=0;
  const next=reclassify(old,templates[0]);
  assert.equal(next.game.hull,7);assert.equal(next.game.stations.Mast.hp,0);
  for(const k of ['crew','officers','guns','inventory'])assert.deepEqual(next.game[k],old.game[k]);
  assert.equal(old.config.maxHull,20);assert.equal(next.config.maxHull,10);
  assert.equal(unpackShip(next).maxCrew,24);
  assert.throws(()=>changeShip(next,{type:'crew',amount:25}),/Crew/);
});
test('smaller classes reject capacity conflicts instead of deleting crew or equipment',()=>{
  const old=defaultSharedShip();old.game.crew=30;
  assert.throws(()=>reclassify(old,templates[0]),/crew capacity/);
  old.game.crew=16;
  assert.throws(()=>reclassify(old,{...templates[0],maxGuns:3}),/gun mounts/);
  assert.throws(()=>reclassify(old,{...templates[0],maxHull:0}),/whole numbers/);
});
test('legacy vessels remain active; archived flag survives decoding',()=>{
  const doc=defaultSharedShip();assert.equal(unpackShip(doc).archived,false);
  doc.config.archived=true;assert.equal(unpackShip(doc).archived,true);
});
