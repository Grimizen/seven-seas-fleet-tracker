import test from 'node:test';
import assert from 'node:assert/strict';
import {templates} from '../dist/templates.js';
import {saveTemplateEntry,deleteTemplateEntry} from '../dist/template-store.js';
test('saved template may be renamed and deleted without altering another entry',()=>{
  const a={...templates[0],id:'a'},b={...templates[1],id:'b'},items=[a,b];
  const updated=saveTemplateEntry(items,{...a,type:'Scout'},a,'a');
  assert.equal(updated[0].type,'Scout');assert.deepEqual(updated[1],b);
  assert.deepEqual(deleteTemplateEntry(updated,updated[0]),[b]);assert.equal(items[0].type,'Small Sloop');
});
test('stale edits and deletions reject instead of overwriting newer defaults',()=>{
  const a={...templates[0],id:'a'},changed={...a,maxHull:99};
  assert.throws(()=>saveTemplateEntry([changed],a,a,'a'),/changed/);
  assert.throws(()=>deleteTemplateEntry([changed],a),/changed/);
  assert.throws(()=>saveTemplateEntry([a],a,null,'b'),/already has/);
});
test('legacy templates without IDs can be edited and an empty list is valid',()=>{
  const {id,...legacy}=templates[0];const updated=saveTemplateEntry([legacy],{...legacy,type:'Legacy renamed'},legacy,'new-id');
  assert.equal(updated[0].id,'new-id');assert.deepEqual(deleteTemplateEntry(updated,updated[0]),[]);
});
