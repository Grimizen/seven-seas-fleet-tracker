import {apply,newShip} from './model.js';

// Keep administrator configuration outside the participant-editable game state.
export function packShip(ship) {
  return {
    config:{id:ship.id,name:ship.name,type:ship.type,maxHull:ship.maxHull,minCrew:5,maxCrew:48,
      stationMax:Object.fromEntries(Object.entries(ship.stations).map(([k,v])=>[k,v.max])),
      mounts:ship.guns.map(({id,name,side})=>({id,name,side}))},
    game:{hull:ship.hull,crew:ship.crew,crewLevel:ship.crewLevel,sails:ship.sails,sinking:ship.sinking,
      stations:Object.fromEntries(Object.entries(ship.stations).map(([k,v])=>[k,{hp:v.hp,assigned:v.assigned}])),
      guns:ship.guns.map(({condition,loaded,assigned})=>({condition,loaded,assigned})),
      inventory:structuredClone(ship.inventory),officers:structuredClone(ship.officers)},revision:0
  };
}
export function unpackShip(doc) {
  const {config:c,game:g}=doc;
  return {...structuredClone(g),id:c.id,name:c.name,type:c.type,maxHull:c.maxHull,
    stations:Object.fromEntries(Object.entries(g.stations).map(([k,v])=>[k,{...v,max:c.stationMax[k]}])),
    guns:g.guns.map((v,i)=>({...v,...c.mounts[i]}))};
}
export function changeShip(doc,action,expected) {
  // Absolute edits should never silently replace a newer value from another player.
  const current=unpackShip(doc);
  const key=action.type==='crew'?'crew':action.type==='sails'?'sails':action.type==='sinking'?'sinking':null;
  const value=key?current[key]:action.type==='officer'?current.officers[action.id]:
    action.type==='assign'?(current.guns.find(g=>g.id===action.id)||current.stations[action.id])?.assigned:
    action.type==='gun-condition'?current.guns.find(g=>g.id===action.id)?.condition:undefined;
  if(expected!==undefined && value!==expected)throw Error('Another player changed this value. Review the latest value and try again.');
  return {...doc,game:packShip(apply(current,action)).game,revision:doc.revision+1};
}
export function transferCargo(from,to,id,amount,newId) {
  if(!Number.isInteger(amount)||amount<1)throw Error('Enter a positive whole quantity.');
  const a=structuredClone(from),b=structuredClone(to),item=a.game.inventory.find(i=>i.id===id);
  if(!item||item.quantity<amount)throw Error('There is not enough stock to transfer.');
  item.quantity-=amount;
  const match=b.game.inventory.find(i=>i.name===item.name&&i.category===item.category);
  if(match)match.quantity+=amount;else b.game.inventory.push({...item,id:newId,quantity:amount});
  a.revision++;b.revision++;return [a,b];
}
// Firestore may return map keys in a different order after a round trip.
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'
  ?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
export function changes(before,after,path=[]) {
  if(equal(before,after))return [];
  if(before && after && typeof before==='object' && typeof after==='object' && !Array.isArray(before) && !Array.isArray(after)
    && Object.keys(before).sort().join('|')===Object.keys(after).sort().join('|'))
    return Object.keys(before).flatMap(k=>changes(before[k],after[k],[...path,k]));
  return [{path,before:structuredClone(before),after:structuredClone(after)}];
}
export function undoChanges(current,patches) {
  const result=structuredClone(current);
  for(const patch of patches){let parent=result;for(const k of patch.path.slice(0,-1))parent=parent[k];const k=patch.path.at(-1);
    if(!equal(parent[k],patch.after))throw Error('This action cannot be undone because another change affects the same data.');
    parent[k]=structuredClone(patch.before);
  }return result;
}
export const defaultSharedShip=()=>packShip(newShip());
