import {cargoCatalogue,catalogueItem,fromCatalogue,marketText} from './cargo-catalogue.js';
import {legacyNote,weightText} from './load.js';
export function catalogueOptions(escape,selected='',ammoOnly=false){return `<option value="">Custom / unclassified</option>`+['Ammunition','Equipment','Rations','Repair','Trade Goods'].map(category=>`<optgroup label="${category}">${cargoCatalogue.filter(v=>v.category===category&&(!ammoOnly||category==='Ammunition')).map(v=>`<option value="${v.id}" ${v.id===selected?'selected':''}>${escape(v.name)}${v.quantityUnit==='cargo unit'?' · per CU':''}</option>`).join('')}</optgroup>`).join('');}
export function cargoEditor(item,escape,{loaded=false}={}){
  return `<label>Catalogue<select name="catalogId" data-cargo-catalogue>${catalogueOptions(escape,item.catalogId,loaded)}</select></label><p data-catalogue-note class="subtle">${escape(catalogueItem(item.catalogId)?.rate?'GM default: '+catalogueItem(item.catalogId).rate:'Choose a GM entry to fill in cargo units, rarity and reference price, or enter custom details.')}</p>
  ${legacyNote(item.unitWeight,escape)}
  <label>Name<input name="name" required maxlength="80" value="${escape(item.name??'')}"></label>
  ${loaded?'<input type="hidden" name="category" value="Ammunition"><input type="hidden" name="quantityUnit" value="item">':`<label>Category<select name="category">${['Equipment','Misc','Quest','Rations','Repair','Ammunition','Trade Goods',...(!['Equipment','Misc','Quest','Rations','Repair','Ammunition','Trade Goods'].includes(item.category)&&item.category?[item.category]:[])].map(v=>`<option ${v===item.category?'selected':''}>${escape(v)}</option>`).join('')}</select></label><label>Quantity basis<select name="quantityUnit"><option value="item" ${item.quantityUnit!=='cargo unit'?'selected':''}>Individual items</option><option value="cargo unit" ${item.quantityUnit==='cargo unit'?'selected':''}>Cargo units of bulk goods</option></select></label><label>Quantity<input name="quantity" type="number" min="0" max="1000000000000" step="${item.quantityUnit==='cargo unit'?'any':'1'}" required value="${item.quantity??1}"></label>`}
  <label>Cargo units per quantity<input name="cargoUnits" ${item.quantityUnit==='cargo unit'?'readonly':''} type="number" min="0" max="1000000000000" step="any" value="${item.cargoUnits??''}" placeholder="Unknown"></label>
  <label>Rarity<select name="rarity"><option value="">Unknown / custom</option>${['Common','Uncommon','Rare'].map(v=>`<option ${v===item.rarity?'selected':''}>${v}</option>`).join('')}</select></label>
  <label>Retail value per quantity (gp)<input name="marketValue" type="number" min="0" max="1000000000000" step="any" value="${item.marketValue??''}" placeholder="Unknown"></label><label>Upper value if a range (gp)<input name="marketValueMax" type="number" min="0" max="1000000000000" step="any" value="${item.marketValueMax??''}" placeholder="Optional"></label>
  <input type="hidden" name="ammoSize" value="${escape(item.ammoSize??'')}"><input type="hidden" name="shotType" value="${escape(item.shotType??'')}">
  ${loaded?'':`<label class="check-label"><input name="personal" type="checkbox" ${item.personal?'checked':''}> Carried on a character (excluded from vessel load)</label>`}`;
}
export function fillCargoEditor(form,id){
  const data=id?fromCatalogue(id):{catalogId:null,ammoSize:null,shotType:null};
  for(const [key,value] of Object.entries(data)){const el=form.elements.namedItem(key);if(el)el.value=value??'';}
  const entry=catalogueItem(id),note=form.querySelector('[data-catalogue-note]');
  if(note)note.textContent=entry?`${entry.rate??weightText(entry.cargoUnits)+' per item'} · ${marketText(entry)} per ${entry.quantityUnit}. Quantities are unchanged: check the quantity basis before saving.`:'Custom entry. Check cargo units and reference values.';
  syncQuantity(form);
}
export function syncQuantity(form){const bulk=form.elements.namedItem('quantityUnit').value==='cargo unit',q=form.elements.namedItem('quantity'),units=form.elements.namedItem('cargoUnits');if(q)q.step=bulk?'any':'1';if(units){units.readOnly=bulk;if(bulk)units.value=1;}}
export function readCargoEditor(form){
  const data={};for(const key of ['name','category','quantityUnit','catalogId','rarity','ammoSize','shotType'])data[key]=form.elements.namedItem(key)?.value??'';
  for(const key of ['cargoUnits','marketValue','marketValueMax']){const v=form.elements.namedItem(key).value;data[key]=v===''?null:Number(v);}
  if(form.elements.namedItem('quantity'))data.quantity=Number(form.elements.namedItem('quantity').value);
  data.personal=form.elements.namedItem('personal')?.checked??false;
  return data;
}
