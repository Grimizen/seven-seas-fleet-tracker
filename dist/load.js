import {gunSpec} from './weapons.js';
import {units,sameCargo} from './cargo-data.js';
import {gunUnits} from './cargo-catalogue.js';
export const weight=units;
export const sameWeight=sameCargo;
export const sloopCapacity=type=>({'Small Sloop':50,'Medium Sloop':100,'Large Sloop':150}[type]??null);
export const capacity=s=>Object.hasOwn(s,'capacityUnits')?s.capacityUnits:s.maxLoad!=null?null:sloopCapacity(s.type);
export const gunWeight=g=>Object.hasOwn(g,'cargoUnits')?(g.cargoUnits??gunUnits(gunSpec(g))):g.cargoWeight!=null?null:gunSpec(g)?gunUnits(gunSpec(g)):null;
export const legacyNote=(value,escape)=>value==null?'':`<p class="amber">Previous value: ${escape(value)} lb. Retained for reference only; not used in cargo-unit calculations.</p>`;
export function loadState(s){
  let guns=0,cargo=0,loaded=0;const missing=[];
  for(const g of s.guns){const w=gunWeight(g);if(w==null)missing.push(g.name+' gun');else guns+=w;if(g.loaded){if(g.loadedCargo?.cargoUnits==null)missing.push(g.name+' loaded round');else loaded+=g.loadedCargo?.cargoUnits;}}
  for(const item of s.inventory){if(item.quantity<=0||item.personal)continue;if(item.cargoUnits==null)missing.push(item.name);else cargo+=item.quantity*item.cargoUnits;}
  const known=guns+cargo+loaded,limit=capacity(s),over=limit!==null&&known>limit+1e-9;
  return {guns,cargo,loaded,known,capacity:limit,missing,over,remaining:limit!==null&&!missing.length?Math.max(0,limit-known):null};
}
export const weightText=n=>n==null?'Unknown':Number(n).toLocaleString(undefined,{maximumFractionDigits:3})+' CU';
export function loadPanel(s,escape){const l=loadState(s);return `<section class="card load-summary" aria-label="Vessel load"><div class="card-head"><h3>Vessel load</h3><strong class="${l.over?'red':l.missing.length?'amber':''}">${l.missing.length?'At least ':''}${weightText(l.known)}${l.capacity!==null?' / '+weightText(l.capacity):''}</strong></div><p>Known load: guns ${weightText(l.guns)} · stored cargo ${weightText(l.cargo)} · loaded ammunition ${weightText(l.loaded)}</p>${l.capacity===null?'<p class="amber">Capacity not set. The owner or GM can enter it in Manage fleet.</p>':''}${l.over?`<p class="red">Over capacity by ${l.missing.length?'at least ':''}${weightText(l.known-l.capacity)}. Resolve excess load with the GM.</p>`:l.remaining!==null?`<p>${weightText(l.remaining)} remaining.</p>`:''}${l.missing.length?`<details><summary>Incomplete load: ${l.missing.length} entries need cargo units</summary><p>${l.missing.map(escape).join(', ')}. Review legacy items in Cargo and loaded rounds in Guns; old pound values have not been converted. Remaining capacity cannot be confirmed.</p></details>`:''}<p class="subtle">CU = cargo units. Load includes guns, stored equipment/cargo and loaded rounds. Equipment carried on a character and the hull itself are excluded. Capacity warnings do not block actions.</p></section>`;}
