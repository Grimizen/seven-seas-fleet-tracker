import {namedOrder} from './ui-order.js';

// One daily ration feeds one person; only the GM's bulk-rations entry has a
// confirmed CU conversion. Food/liquid cargo units are not equivalent to meals.
export function rationRate(item){
  if(!item||item.personal)return 0;
  if(item.catalogId==='bulk-ration-bulk'&&item.quantityUnit==='cargo unit')return 30;
  if(item.quantityUnit==='cargo unit'||['food-items','liquid-items'].includes(item.catalogId))return 0;
  return item.catalogId==='rations'||item.category==='Rations'?1:0;
}
export const filledOfficerCount=s=>Object.values(s.officers??{}).filter(name=>typeof name==='string'&&name.trim().length>0).length;
export const rationStocks=s=>namedOrder(s.inventory.filter(i=>rationRate(i)>0));
export const provisionSnapshot=(s,a)=>({crew:s.crew,officers:filledOfficerCount(s),item:s.inventory.find(i=>i.id===a.stock)??null});
export function provisionPlan(s,a){
  for(const key of ['exempt','extra','caught'])if(!Number.isSafeInteger(a[key])||a[key]<0||a[key]>100000)throw Error('Enter nonnegative whole numbers for non-consuming people, additional people and catch.');
  const officers=filledOfficerCount(s),aboard=s.crew+officers+a.extra;
  if(a.exempt>aboard)throw Error('Non-consuming people cannot exceed crew, filled officer roles and extra people combined.');
  const people=aboard-a.exempt,rations=Math.max(0,people-a.caught),surplus=Math.max(0,a.caught-people);
  const item=s.inventory.find(i=>i.id===a.stock),rate=rationRate(item),quantity=rate?rations/rate:0;
  if(rations&&!rate)throw Error('Choose daily ration stock. Classify individual rations as Rations, or use Rations (bulk) from the catalogue.');
  if(rations&&(!Number.isFinite(item.quantity)||item.quantity+1e-9<quantity))throw Error(`Not enough rations: need ${rations}, but this stock provides ${Number((item.quantity*rate).toFixed(6))}. No stock will be deducted.`);
  return {officers,aboard,people,rations,surplus,item,quantity,remaining:item?Math.max(0,Number((item.quantity-quantity).toPrecision(15))):null};
}
export function useProvisions(s,a){const p=provisionPlan(s,a);const next=structuredClone(s);if(p.rations)next.inventory.find(i=>i.id===a.stock).quantity=p.remaining;return next;}
export function provisionMessage(s,a){const p=provisionPlan(s,a);return `${s.name}: Daily provisions${a.day?.trim()?' ['+a.day.trim().slice(0,60)+']':''}: ${s.crew} general crew + ${p.officers} officers + ${a.extra} extra people − ${a.exempt} exempt − ${a.caught} catch = ${p.rations} stored rations used${p.rations?' from '+p.item.name:''}${p.surplus?`; ${p.surplus} surplus catch (not added to cargo)`:''}`;}
export function provisionsPanel(s,escape,draft={}){const stocks=rationStocks(s),exempt=draft.exempt??Math.min(1,s.crew+filledOfficerCount(s)),stock=draft.stock??stocks[0]?.id??'';
  return `<details class="card" id="provisions"><summary>Daily provisions</summary><form id="provisions-form" class="stack"><p>${s.crew} general crew + ${filledOfficerCount(s)} filled officer roles. One ration per consuming person; one fish offsets one ration. Apply once per in-game day.</p><p class="subtle">Each filled officer role adds one person, including PCs and named NPCs. Officers are already counted: remove any previously entered officer allowance from Additional people. Blank roles count as zero; the same name in two roles counts twice.</p><div class="slot-counts"><label>People not consuming rations (crew / officers / guests)<input name="exempt" type="number" min="0" max="100000" step="1" required value="${escape(exempt)}"></label><label>Additional people not in crew or officer roles<input name="extra" type="number" min="0" max="100000" step="1" required value="${escape(draft.extra??0)}"></label><label>Food caught today (ration equivalents)<input name="caught" type="number" min="0" max="100000" step="1" required value="${escape(draft.caught??0)}"></label></div><label>Ration stock<select name="stock"><option value="">Choose ration stock</option>${stocks.map(i=>`<option value="${escape(i.id)}" ${stock===i.id?'selected':''}>${escape(i.name)} — ${Number((i.quantity*rationRate(i)).toFixed(6))} rations${i.quantityUnit==='cargo unit'?' (30 per CU)':''}</option>`).join('')}</select></label><label>In-game day / note (optional)<input name="day" maxlength="60" value="${escape(draft.day??'')}" placeholder="e.g. Voyage day 7"></label><p id="provisions-preview" role="status" aria-live="polite"></p><button class="primary" type="submit">Apply daily provisions…</button><p class="subtle">Non-consuming people, additional people and stock choice are remembered on this device for this vessel. Catch resets after applying. Check the ship’s log before applying; day labels do not prevent duplicate days. Insufficient stock cancels the whole deduction. Surplus catch is not stored automatically. Generic food and liquids need a GM ruling before conversion to daily rations.</p></form></details>`;
}
export function readProvisions(form){const f=new FormData(form);return {type:'daily-rations',exempt:Number(f.get('exempt')),extra:Number(f.get('extra')),caught:Number(f.get('caught')),stock:String(f.get('stock')??''),day:String(f.get('day')??'').trim()};}
