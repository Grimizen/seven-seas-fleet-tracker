import {weight} from './load.js';
import {armamentFor,validateArmament,normalizeGuns} from './weapons.js';
import {newShip,stationDefaults} from './model.js';

export const templates = ['Small','Medium','Large'].map((size,i)=>({
  id:`sloop-${size.toLowerCase()}`,type:`${size} Sloop`,maxHull:[10,15,20][i],
  minCrew:[2,3,5][i],maxCrew:[24,36,48][i],maxGuns:[5,7,9][i],
  stationMax:Object.fromEntries(Object.keys(stationDefaults).map((key,j)=>[key,[
    [2,1,2,3,1,1,1,1,2],[3,2,3,5,2,2,2,2,3],[5,3,5,8,3,3,3,3,5]
  ][i][j]]))
}));

export function validateTemplate(t){
  if(!t.type?.trim()||t.type.length>60)throw Error('Enter a class name of up to 60 characters.');
  for(const key of ['maxHull','maxCrew','minCrew','maxGuns'])
    if(!Number.isInteger(t[key])||t[key]< (key==='maxGuns'?0:1)||t[key]>10000)throw Error('Template values must be whole numbers between 1 and 10,000 (gun capacity may be zero).');
  if(t.minCrew>t.maxCrew)throw Error('Minimum crew cannot exceed maximum crew.');
  for(const key of Object.keys(stationDefaults))if(!Number.isInteger(t.stationMax[key])||t.stationMax[key]<1||t.stationMax[key]>10000)throw Error('Every section needs a positive whole HP maximum.');
  weight(t.maxLoad,true);
  validateArmament(armamentFor(t),t.maxGuns);
  return t;
}

export function reclassify(doc,template){
  validateTemplate(template);
  if(doc.game.crew>template.maxCrew)throw Error('Reduce crew before choosing this class; its crew capacity is too small.');
  if(doc.config.mounts.length>template.maxGuns)throw Error('This class has fewer gun mounts than the vessel currently carries. Choose a larger capacity.');
  const a=armamentFor(template);validateArmament(a,template.maxGuns,doc.config.mounts);
  const next=structuredClone(doc),old=doc.config;
  next.config={...old,maxLoad:template.maxLoad??null,armament:a,type:template.type,maxHull:template.maxHull,minCrew:template.minCrew,maxCrew:template.maxCrew,maxGuns:template.maxGuns,stationMax:structuredClone(template.stationMax)};
  const preserveDamage=(hp,max,newMax)=>hp===0?0:Math.max(0,newMax-(max-hp));
  next.game.hull=preserveDamage(doc.game.hull,old.maxHull,template.maxHull);
  for(const [key,value] of Object.entries(next.game.stations))value.hp=preserveDamage(value.hp,old.stationMax[key],template.stationMax[key]);
  next.revision++;
  return next;
}

export function createFromTemplate(id,name,template){
  validateTemplate(template);
  const ship=newShip(id,name);
  ship.maxLoad=template.maxLoad??null;
  ship.type=template.type;ship.maxHull=template.maxHull;ship.hull=template.maxHull;
  ship.minCrew=template.minCrew;ship.maxCrew=template.maxCrew;ship.maxGuns=template.maxGuns;
  ship.crew=Math.min(16,template.maxCrew);
  ship.guns=ship.guns.slice(0,template.maxGuns);
  ship.armament=armamentFor(template);
  ship.guns=ship.guns.filter(g=>ship.armament[['Bow','Stern'].includes(g.side)?'chaseTypes':'broadsideTypes'].includes('Long Gun'));
  const counts={};ship.guns=ship.guns.filter(g=>{counts[g.side]=(counts[g.side]??0)+1;return counts[g.side]<=ship.armament.layout[g.side];});
  ship.guns=normalizeGuns(ship.guns);
  ship.inventory[0].quantity=30-ship.guns.length;
  for(const [key,value] of Object.entries(ship.stations))value.hp=value.max=template.stationMax[key];
  return ship;
}

export const templateKey=t=>t.id??`legacy:${t.type}`;
