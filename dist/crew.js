import {slotsFor} from './weapons.js';
export function crewTargets(s){
  const assigned=Object.values(s.stations).reduce((n,v)=>n+v.assigned,0)+s.guns.reduce((n,g)=>n+g.assigned,0);
  return [{id:'unassigned',name:'Unassigned general crew',count:s.crew-assigned},...Object.entries(s.stations).sort(([a],[b])=>a.localeCompare(b)).map(([name,v])=>({id:'station:'+name,name:name+' assigned crew',count:v.assigned})),...slotsFor(s).filter(v=>v.gun).map(({gun:g,name})=>({id:'gun:'+g.id,name:name+' gun crew',count:g.assigned}))];
}
export function loseCrew(ship,losses){
  const s=structuredClone(ship),targets=crewTargets(s),seen=new Set();let total=0;
  if(!Array.isArray(losses))throw Error('Choose the affected crew.');
  for(const loss of losses){const target=targets.find(v=>v.id===loss.target);
    if(!target||seen.has(loss.target)||!Number.isInteger(loss.amount)||loss.amount<1||loss.amount>target.count)throw Error('Losses must be whole numbers within the available crew for each assignment. Review the latest counts.');
    seen.add(loss.target);total+=loss.amount;
    if(loss.target.startsWith('station:'))s.stations[loss.target.slice(8)].assigned-=loss.amount;
    if(loss.target.startsWith('gun:'))s.guns.find(g=>g.id===loss.target.slice(4)).assigned-=loss.amount;
  }
  if(!total||total>s.crew)throw Error('Enter at least one casualty, within the crew aboard.');
  s.crew-=total;return s;
}
export function casualtyControls(s,escape,section=null){const targets=crewTargets(s).filter(t=>section?t.id==='station:'+section:true);return `<details class="card"><summary>${section?'Record crew losses here':'Record crew casualties'}</summary><form class="casualty-form"><p class="subtle">Enter sailors lost from each affected assignment. This reduces crew and allocations together; officers and section HP are unchanged. ${section?'Cannon teams are separate: record their losses in Crew.':'For general losses, choose the affected groups explicitly.'}</p><div class="casualty-targets">${targets.map(t=>`<label>${escape(t.name)} (${t.count} available)<input data-casualty="${escape(t.id)}" type="number" min="0" max="${t.count}" step="1" value="0" ${t.count?'':'disabled'}></label>`).join('')}</div><button class="danger" type="submit">Record casualties…</button></form></details>`;}
