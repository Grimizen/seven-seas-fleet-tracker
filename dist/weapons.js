import {cargoDetails,sameCargo} from './cargo-data.js';
export const families=['Long Gun','Carronade','Howitzer','Swivel Gun'];
export const sides=['Port','Starboard','Bow','Stern'];
export const catalogue=[
  ...[[6,'Light','d2',3,300],[9,'Light','d4',3,450],[12,'Mid','d8',4,600],[18,'Mid','2d8',5,900],[24,'Heavy','2d12',6,1200],[36,'Heavy','3d12',8,1800],[48,'S. Heavy','5d12',10,2400]].map(r=>entry('long','Long Gun','LG',r,0,24)),
  ...[[12,'Light','d8',3,480],[18,'Light','2d8',3,720],[24,'Mid','2d12',4,960],[36,'Mid','3d12',5,1440],[48,'Heavy','5d12',6,1920]].map(r=>entry('carronade','Carronade','CA',r,0,12)),
  ...[[18,'Mid','2d8',5,1350],[24,'Heavy','2d12',6,1800],[36,'Heavy','3d12',8,2700],[48,'S. Heavy','5d12',10,3600]].map(r=>entry('howitzer','Howitzer','HW',r,12,36)),
  ...[[1.5,'Swivel','2d12',1,60],[3,'Swivel','4d12',1,120]].map(r=>entry('swivel','Swivel Gun','SW',r,0,12))
];
function entry(prefix,family,code,[poundage,weight,damage,crew,cost],minRange,range){return {id:`${prefix}-${poundage}`,family,code,poundage,weight,damage,crew,cost,minRange,range,name:`${poundage}lb ${family}`};}
export const gunSpec=g=>catalogue.find(t=>t.id===(g.gunType??'long-9'));
export const defaultArmament=max=>({layout:{Port:Math.floor(max/2),Starboard:Math.floor(max/2),Bow:max%2,Stern:0},broadsideTypes:[...families],chaseTypes:[...families]});
export function armamentFor(s){
  if(s.armament)return structuredClone(s.armament);
  const a=defaultArmament(s.maxGuns??9),required=Object.fromEntries(sides.map(side=>[side,(s.guns??[]).filter(g=>g.side===side).length]));
  // Legacy records may have an asymmetric loadout. Never hide an existing gun.
  for(const side of sides)while(a.layout[side]<required[side]){const donor=['Bow','Stern','Port','Starboard'].find(v=>a.layout[v]>required[v]);if(!donor)break;a.layout[donor]--;a.layout[side]++;}
  return a;
}
export function normalizeGuns(guns){const counts={Port:0,Starboard:0,Bow:0,Stern:0};return guns.map(g=>{counts[g.side]++;return {...g,gunType:g.gunType??'long-9',slotId:g.slotId??`${g.side.toLowerCase()}-${counts[g.side]}`};});}
export const loadoutSignature=s=>JSON.stringify({armament:[...sides.map(side=>armamentFor(s).layout[side]),[...armamentFor(s).broadsideTypes].sort(),[...armamentFor(s).chaseTypes].sort()],guns:normalizeGuns(s.guns).map(g=>[g.id,g.slotId,g.gunType,g.cargoWeight??null,g.cargoUnits??null,Object.hasOwn(g,'cargoUnits')]).sort((a,b)=>a[0].localeCompare(b[0]))});
export function slotsFor(s){const a=armamentFor(s),guns=normalizeGuns(s.guns);return sides.flatMap(side=>Array.from({length:a.layout[side]},(_,i)=>{const id=`${side.toLowerCase()}-${i+1}`;return {id,side,name:`${side}${['Bow','Stern'].includes(side)?' chase':''} ${i+1}`,gun:guns.find(g=>g.slotId===id)};}));}
export const allowedTypes=(a,side)=>a[['Bow','Stern'].includes(side)?'chaseTypes':'broadsideTypes'];
export function validateArmament(a,max,guns=[]){
  if(!a?.layout||!sides.every(side=>Number.isInteger(a.layout[side])&&a.layout[side]>=0&&a.layout[side]<=100)||sides.reduce((sum,side)=>sum+a.layout[side],0)!==max||max>100)throw Error('Slot counts must total gun capacity, with at most 100 slots.');
  for(const key of ['broadsideTypes','chaseTypes'])if(!Array.isArray(a[key])||!a[key].length||a[key].some(t=>!families.includes(t)))throw Error('Choose at least one permitted gun family for each fitment.');
  const seen=new Set();
  for(const g of normalizeGuns(guns)){
    const slot=slotsFor({armament:a,guns:[]}).find(s=>s.id===g.slotId),spec=gunSpec(g);
    if(!slot||slot.side!==g.side||seen.has(g.slotId))throw Error('Remove or relocate guns before reducing occupied slots.');
    if(!spec||!allowedTypes(a,slot.side).includes(spec.family))throw Error('An installed gun conflicts with the proposed mounting restrictions.');
    seen.add(g.slotId);
  }
  return a;
}
export function refit(ship,slotId,type){
  const s=structuredClone(ship);s.guns=normalizeGuns(s.guns);s.armament=armamentFor(s);
  const slot=slotsFor(s).find(v=>v.id===slotId),spec=catalogue.find(t=>t.id===type);
  if(!slot||type&&!spec)throw Error('Choose an existing slot and cannon.');
  if(spec&&!allowedTypes(s.armament,slot.side).includes(spec.family))throw Error('This gun family is not permitted in that slot.');
  if(slot.gun?.gunType===type)return s;
  if(slot.gun?.loaded){const round={name:slot.gun.loaded,category:'Ammunition',...cargoDetails(slot.gun.loadedCargo??{}),...(slot.gun.loadedUnitWeight!=null?{unitWeight:slot.gun.loadedUnitWeight}:{})},item=s.inventory.find(i=>i.category==='Ammunition'&&i.name===round.name&&sameCargo(i,round));if(item)item.quantity++;else s.inventory.push({id:crypto.randomUUID(),...round,quantity:1});}
  s.guns=s.guns.filter(g=>g.slotId!==slotId);
  if(spec)s.guns.push({id:crypto.randomUUID(),slotId,side:slot.side,name:slot.name,gunType:spec.id,condition:'operational',loaded:null,assigned:0});
  return s;
}
export function moveGun(ship,source,destination){
  const s=structuredClone(ship);s.guns=normalizeGuns(s.guns);const slots=slotsFor(s),from=slots.find(v=>v.id===source),to=slots.find(v=>v.id===destination);
  if(!from?.gun||!to||to.gun)throw Error('Choose an occupied source and an empty destination.');
  if(!allowedTypes(armamentFor(s),to.side).includes(gunSpec(from.gun).family))throw Error('This cannon is not allowed in the destination slot.');
  const g=s.guns.find(g=>g.id===from.gun.id);g.slotId=to.id;g.side=to.side;g.name=to.name;return s;
}
export function ammoAllowed(g,item){return item.category==='Ammunition'&&(gunSpec(g)?.family!=='Swivel Gun'||(item.shotType==='lead'||/\b(lead|swivel)\s+shot\b/i.test(item.name)));}
export function shotNotes(name){if(/chain\s+shot/i.test(name??''))return 'Chain: double damage to masts.';if(/(grape|fire)\s+shot/i.test(name??''))return 'Half range and ship damage; additional 5× damage to crew.'+(/fire/i.test(name)?' Fire: critical failure on 1–2; critical hits start fires (Light d4 / Mid 2d4 / Heavy 3d4 / S. Heavy 4d4).':'');return '';}
