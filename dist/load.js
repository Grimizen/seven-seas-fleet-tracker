import {gunSpec} from './weapons.js';
export function weight(value,optional=false){
  if(optional&&(value===null||value===undefined||value===''))return null;
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1e12)throw Error('Enter a nonnegative weight in pounds.');
  return value;
}
export const gunWeight=g=>g.cargoWeight??gunSpec(g)?.poundage??null;
export const sameWeight=(a,b)=>(a.unitWeight??null)===(b.unitWeight??null);
export function loadState(s){
  let guns=0,cargo=0,loaded=0;const missing=[];
  for(const g of s.guns){const w=gunWeight(g);if(w==null)missing.push(g.name+' gun');else guns+=w;if(g.loaded){if(g.loadedUnitWeight==null)missing.push(g.name+' loaded round');else loaded+=g.loadedUnitWeight;}}
  for(const item of s.inventory){if(item.quantity<=0)continue;if(item.unitWeight==null)missing.push(item.name);else cargo+=item.quantity*item.unitWeight;}
  const known=guns+cargo+loaded,capacity=s.maxLoad??null,over=capacity!==null&&known>capacity;
  return {guns,cargo,loaded,known,capacity,missing,over,remaining:capacity!==null&&!missing.length?capacity-known:null};
}
export const weightText=n=>n==null?'Unknown':Number(n).toLocaleString(undefined,{maximumFractionDigits:3})+' lb';
export function loadPanel(s,escape){const l=loadState(s);return `<section class="card load-summary" aria-label="Vessel load"><div class="card-head"><h3>Vessel load</h3><strong class="${l.over?'red':l.missing.length?'amber':''}">${l.missing.length?'At least ':''}${weightText(l.known)}${l.capacity!==null?' / '+weightText(l.capacity):''}</strong></div><p>Known weight: guns ${weightText(l.guns)} · stored cargo ${weightText(l.cargo)} · loaded ammunition ${weightText(l.loaded)}</p>${l.capacity===null?'<p class="amber">Capacity not set. The owner or GM can enter it in Manage fleet.</p>':''}${l.over?`<p class="red">Over capacity by ${l.missing.length?'at least ':''}${weightText(l.known-l.capacity)}. Resolve excess load with the GM.</p>`:l.remaining!==null?`<p>${weightText(l.remaining)} remaining.</p>`:''}${l.missing.length?`<details><summary>Incomplete weight: ${l.missing.length} entries need weights</summary><p>${l.missing.map(escape).join(', ')}. Remaining capacity cannot be confirmed.</p></details>`:''}<p class="subtle">Load includes guns, stored equipment/cargo and loaded rounds. Crew and hull weight are excluded. Capacity warnings do not block actions.</p></section>`;}
