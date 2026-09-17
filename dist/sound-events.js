export const sounds={fire:['cannon-1','cannon-2'],broadside:['cannon-1','cannon-2'],damage:['damage-1','damage-2'],casualty:['crew-1','crew-2'],sails0:['sails-stowed'],sails1:['sails-half'],sails2:['sails-full']};
export function actionSound(action,before,changed=true){
  if(!changed)return null;
  if(action.type==='broadside-fire')return 'broadside';
  if(action.type==='fire')return 'fire';
  if(action.type==='crew-loss')return 'casualty';
  if(action.type==='sails'&&Number(action.amount)!==before.sails)return 'sails'+action.amount;
  if(action.type==='hp'&&action.amount<0&&(action.id==='Hull'?before.hull:before.stations[action.id]?.hp)>0)return 'damage';
  return null;
}
