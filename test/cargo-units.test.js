import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cargoCatalogue,catalogueItem,fromCatalogue,gunUnits} from '../dist/cargo-catalogue.js';
import {newShip,apply} from '../dist/model.js';
import {gunWeight,loadState,capacity} from '../dist/load.js';
import {catalogue,refit,ammoAllowed,loadoutSignature} from '../dist/weapons.js';
import {packShip,unpackShip,transferCargo,changes,undoChanges} from '../dist/shared-model.js';
import {templates,createFromTemplate,reclassify} from '../dist/templates.js';
import {saveTemplateEntry} from '../dist/template-store.js';
const approx=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('all 18 gun cargo figures match the GM family formulas, including fractional carronades',()=>{
  assert.deepEqual(catalogue.map(gunUnits),[6,9,12,18,24,36,48,9,13.5,18,27,36,27,36,54,72,1,1]);
  for(const g of catalogue)assert.equal(catalogueItem('gun-'+g.id).marketValue,g.cost);
  assert.equal(new Set(cargoCatalogue.map(v=>v.id)).size,cargoCatalogue.length);
});
test('ammo ratios, rarity, silver prices and treasure ranges follow the coloured PDF tables',()=>{
  for(const [id,quantity] of [['shot-swivel',35],['shot-lead-light',16],['shot-chain-mid',8],['shot-grape-heavy',4],['shot-fire-super-heavy',2],['rations',30],['small-arms',40],['armour',20]])approx(catalogueItem(id).cargoUnits*quantity,1);
  assert.equal(catalogueItem('shot-swivel').marketValue,.5);
  assert.equal(catalogueItem('bulk-silver-ore').marketValue,2.5);
  assert.equal(catalogueItem('gun-howitzer-18').rarity,'Uncommon');
  assert.equal(catalogueItem('gun-howitzer-36').rarity,'Rare');
  assert.equal(catalogueItem('bulk-magic-stones').marketValueMax,50000);
  assert.equal(catalogueItem('bulk-treasure-common').marketValueMax,250);
  assert.equal(catalogueItem('bulk-gold').marketValue,2500);
});
test('new Sloops receive confirmed capacities and known starting light rounds',()=>{
  assert.deepEqual(templates.map(capacity),[50,100,150]);
  for(const t of templates)assert.equal(createFromTemplate(t.id,t.type,t).capacityUnits,t.capacityUnits);
  assert.equal(loadState(newShip()).known,37.875);
  assert.equal(loadState(newShip()).remaining,112.125);
});
test('legacy pounds never become cargo units and are preserved through classification and class edits',()=>{
  const s=newShip();delete s.capacityUnits;s.maxLoad=800;
  s.guns[0].cargoWeight=99;delete s.guns[0].loadedCargo;s.guns[0].loadedUnitWeight=9;
  s.inventory=[{id:'old',name:'Lead shot',category:'Ammunition',quantity:26,unitWeight:9}];
  assert.equal(capacity(s),null);assert.equal(gunWeight(s.guns[0]),null);assert.equal(loadState(s).missing.length,3);
  const reviewed=apply(s,{type:'edit-item',id:'old',...fromCatalogue('shot-lead-light')});
  assert.equal(reviewed.inventory[0].unitWeight,9);assert.equal(reviewed.inventory[0].quantity,26);assert.equal(s.inventory[0].cargoUnits,undefined);
  const packed=packShip(reviewed);assert.deepEqual(unpackShip(packed),reviewed);
  const changed=reclassify(packed,templates[2]);assert.equal(changed.config.maxLoad,800);assert.equal(changed.config.capacityUnits,150);assert.deepEqual(changed.game.inventory,packed.game.inventory);
  const old={...templates[2],maxLoad:800};delete old.capacityUnits;
  assert.equal(saveTemplateEntry([old],{...templates[2],capacityUnits:150},old,old.id)[0].maxLoad,800);
  const signature=loadoutSignature(s);s.guns[0].cargoUnits=null;assert.equal(gunWeight(s.guns[0]),9);assert.notEqual(loadoutSignature(s),signature);
});
test('personal carried equipment is excluded, but loaded rounds always count',()=>{
  const s=apply(newShip(),{type:'add-item',id:'personal',...fromCatalogue('small-arms'),personal:true,amount:40});
  assert.equal(loadState(s).known,37.875);
  s.inventory.at(-1).personal=false;assert.equal(loadState(s).known,38.875);
});
test('fractional bulk quantities transfer and undo without merging different reference values',()=>{
  let s=apply(newShip(),{type:'add-item',id:'silk',...fromCatalogue('bulk-silk'),amount:2.5});
  const other=newShip('other');other.inventory.push({id:'discount',...fromCatalogue('bulk-silk'),marketValue:1000,quantity:1});
  const a=packShip(s),b=packShip(other),[x,y]=transferCargo(a,b,'silk',.75,'moved');
  assert.equal(x.game.inventory.find(v=>v.id==='silk').quantity,1.75);
  assert.equal(y.game.inventory.find(v=>v.id==='moved').quantity,.75);
  approx(loadState(unpackShip(x)).known+loadState(unpackShip(y)).known,loadState(s).known+loadState(other).known);
  assert.deepEqual(undoChanges(x.game,changes(a.game,x.game)),a.game);
  assert.throws(()=>apply(s,{type:'add-item',id:'bad',...fromCatalogue('shot-swivel'),amount:.5}));
  assert.throws(()=>transferCargo(a,b,'lead',.5,'bad'));
  assert.throws(()=>apply(s,{type:'add-item',id:'bad',...fromCatalogue('bulk-silk'),cargoUnits:2,amount:1}));
});
test('new swivel ammunition reloads, conserves metadata on removal, and keeps retail values',()=>{
  let s=refit(newShip(),'bow-1','swivel-3'),g=s.guns.find(g=>g.slotId==='bow-1');
  s=apply(s,{type:'add-item',id:'swivel-rounds',...fromCatalogue('shot-swivel'),amount:35});
  assert.equal(ammoAllowed(g,fromCatalogue('shot-swivel')),true);
  const before=loadState(s).known;s=apply(s,{type:'reload',id:g.id,ammo:'swivel-rounds'});approx(loadState(s).known,before);
  assert.equal(s.guns.find(v=>v.id===g.id).loadedCargo.ammoSize,'swivel');
  s=refit(s,'bow-1','');approx(loadState(s).known,before-1);
  const round=s.inventory.find(v=>v.id==='swivel-rounds');assert.equal(round.quantity,35);assert.equal(round.marketValue,.5);
});
