import {crewTargets} from './crew.js';
import {normalizeGuns} from './weapons.js';
export const assignmentName=(s,id)=>normalizeGuns(s.guns).find(g=>g.id===id)?.name??id;
export function actionMessage(s,a,fallback){
  const label=assignmentName(s,a.id);
  let text;
  if(a.type==='assign')text=`${label}: assigned crew ${a.amount}`;
  if(a.type==='gun-condition')text=`${label}: condition changed to ${a.value}`;
  if(a.type==='fire')text=`Fired ${label}`;
  if(a.type==='reload')text=`Reloaded ${label}`;
  if(a.type==='loaded-weight')text=`${label}: classified loaded round as ${a.cargo.name}, ${a.cargo.cargoUnits===null?'unknown cargo units':a.cargo.cargoUnits+' CU'}`;
  if(a.type==='crew-loss'){const targets=crewTargets(s);text='Crew casualties: '+a.losses.map(l=>`${l.amount} from ${targets.find(t=>t.id===l.target)?.name??l.target}`).join(', ');}
  if(a.type==='end-sinking')text='Ended sinking countdown after GM/table confirmation';
  return text===undefined?fallback:`${s.name}: ${text}`;
}
