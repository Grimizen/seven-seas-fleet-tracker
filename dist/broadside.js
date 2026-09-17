import {slotsFor,ammoAllowed} from './weapons.js';
import {namedOrder} from './ui-order.js';

export const isBroadside=action=>['broadside-fire','broadside-reload'].includes(action.type);
export function broadsidePlan(ship,side,mode,ammoId){
  if(!['Port','Starboard'].includes(side)||!['fire','reload'].includes(mode))throw Error('Choose a port or starboard broadside.');
  const slots=slotsFor(ship).filter(v=>v.side===side);
  const ammo=ship.inventory.find(i=>i.id===ammoId);
  const eligible=slots.filter(({gun:g})=>g&&g.condition==='operational'&&(mode==='fire'?!!g.loaded:!g.loaded));
  const targets=mode==='reload'?eligible.filter(({gun})=>ammo&&ammoAllowed(gun,ammo)):eligible;
  let reason='';
  if(!ship.stations['Gun Deck'].hp)reason='Restore the gun deck first.';
  else if(mode==='reload'&&!ship.stations['Powder Dock'].hp)reason='Restore the powder dock first.';
  else if(mode==='reload'&&!ammo)reason='Choose ammunition.';
  else if(!targets.length)reason=mode==='fire'?'No ready guns on this side.':'No empty operational guns can load this ammunition.';
  else if(mode==='reload'&&ammo.quantity<targets.length)reason=`Need ${targets.length} rounds; only ${ammo.quantity} available. No guns will reload.`;
  return {targets,ammo,reason,skipped:slots.length-targets.length};
}
// A batch must match what the player saw, including round classification. Crew and
// unrelated ship edits need not block it; the cloud layer separately guards refits.
export function broadsideSnapshot(s,a){
  return {deck:s.stations['Gun Deck'].hp,guns:slotsFor(s).filter(v=>v.side===a.side).map(v=>({slot:v.id,gun:v.gun?{id:v.gun.id,condition:v.gun.condition,loaded:v.gun.loaded,loadedCargo:v.gun.loadedCargo??null,loadedUnitWeight:v.gun.loadedUnitWeight??null}:null})),...(a.type==='broadside-reload'?{powder:s.stations['Powder Dock'].hp,ammo:s.inventory.find(i=>i.id===a.ammo)??null}:{})};
}
export function broadsideControls(s,side,escape,selected=''){
  const ammo=namedOrder(s.inventory.filter(i=>i.category==='Ammunition'&&i.quantity>0));
  const choice=selected?(ammo.some(i=>i.id===selected)?selected:''):ammo[0]?.id;
  const fire=broadsidePlan(s,side,'fire'),reload=broadsidePlan(s,side,'reload',choice);
  const names=plan=>plan.targets.map(v=>escape(v.name)).join(', ');
  return `<div class="card stack broadside-controls" data-battery-controls="${side}"><h3>${side} broadside</h3><p>${fire.targets.length?`Ready: ${names(fire)}.`:'No ready guns.'} Empty slots and unavailable guns are skipped.</p><button class="primary" data-broadside-fire="${side}" ${fire.reason?'disabled':''}>Fire ${side.toLowerCase()} broadside (${fire.targets.length})</button>${fire.reason?`<p class="subtle">${escape(fire.reason)}</p>`:''}<label>Ammunition for ${side.toLowerCase()} broadside<select data-broadside-ammo="${side}">${ammo.length?(!choice?'<option value="" selected>Previous ammunition unavailable — choose a round</option>':'')+ammo.map(i=>`<option value="${escape(i.id)}" ${i.id===choice?'selected':''}>${escape(i.name)} (${i.quantity})</option>`).join(''):'<option value="">No ammunition in stores</option>'}</select></label><p aria-live="polite">${reload.targets.length?`Reload: ${names(reload)}. Requires ${reload.targets.length} rounds.`:'No eligible guns for this ammunition.'} ${escape(reload.reason)}</p><button data-broadside-reload="${side}" ${reload.reason?'disabled':''}>Reload ${side.toLowerCase()} broadside (${reload.targets.length})</button><p class="subtle">Complete only after the uninterrupted reload turn. Loaded, disabled and incompatible guns are skipped. Ammunition size and crew requirements remain a table check. Each batch is one undoable action.</p></div>`;
}
