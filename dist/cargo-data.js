// Metadata travels with cargo and loaded rounds; legacy pounds are retained only for review.
export const cargoFields=['cargoUnits','quantityUnit','catalogId','rarity','marketValue','marketValueMax','ammoSize','shotType','unitWeight','personal'];
export const cargoDetails=item=>Object.fromEntries(cargoFields.filter(k=>item[k]!==undefined).map(k=>[k,item[k]]));
export const sameCargo=(a,b)=>cargoFields.every(k=>(a[k]??null)===(b[k]??null));
export const validQuantity=(item,n)=>Number.isFinite(n)&&n>=0&&n<=1e12&&(item.quantityUnit==='cargo unit'||Number.isInteger(n));
export function units(value,optional=false){
  if(optional&&(value===null||value===undefined||value===''))return null;
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1e12)throw Error('Enter a nonnegative number of cargo units.');
  return value;
}
export function validateCargo(a){
  if(!a.name?.trim()||!a.category?.trim())throw Error('Enter an item name and category.');
  if(!['item','cargo unit'].includes(a.quantityUnit))throw Error('Choose how quantity is measured.');
  const result={name:a.name.trim().slice(0,80),category:a.category.trim().slice(0,40),cargoUnits:units(a.cargoUnits,true),quantityUnit:a.quantityUnit,
    personal:a.personal===true,catalogId:a.catalogId||null,rarity:a.rarity||null,marketValue:units(a.marketValue,true),marketValueMax:units(a.marketValueMax,true),ammoSize:a.ammoSize||null,shotType:a.shotType||null};
  if(result.rarity&&!['Common','Uncommon','Rare'].includes(result.rarity))throw Error('Choose a valid rarity.');
  if(result.quantityUnit==='cargo unit'&&result.cargoUnits!==1)throw Error('Bulk quantity is already in cargo units: its cargo multiplier must be 1.');
  if(result.marketValueMax!==null&&(result.marketValue===null||result.marketValueMax<result.marketValue))throw Error('Maximum market value must be at least the minimum.');
  return result;
}
