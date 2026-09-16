import {cargoEditor} from './cargo-editor.js';
import {marketText} from './cargo-catalogue.js';
import {loadPanel,weightText} from './load.js';
export const categories = ['Equipment','Misc','Quest','Rations','Repair','Ammunition','Trade Goods'];
export function filteredInventory(items, filters) {
  const query = filters.query.trim().toLocaleLowerCase();
  return items.filter(item => (!query || `${item.name} ${item.category}`.toLocaleLowerCase().includes(query))
    && (!filters.category || item.category === filters.category) && (!filters.rarity || item.rarity===filters.rarity)
    && (filters.stock !== 'available' || item.quantity > 0)
    && (filters.stock !== 'empty' || item.quantity === 0))
    .sort((a,b) => filters.sort==='value-density'?((b.cargoUnits>0?(b.marketValue??0)/b.cargoUnits:-1)-(a.cargoUnits>0?(a.marketValue??0)/a.cargoUnits:-1)||a.name.localeCompare(b.name)):filters.sort === 'quantity' ? b.quantity-a.quantity || a.name.localeCompare(b.name)
      : filters.sort === 'category' ? a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name));
}
export function cargoResults(s,ships,filters,escape) {
  const items=filteredInventory(s.inventory,filters);
  return `<p class="subtle" role="status">${items.length} of ${s.inventory.length} items · ${s.guns.filter(g=>g.loaded).length} rounds loaded separately</p>
  ${!items.length?`<div class="cargo-empty"><h3>${s.inventory.length?'No matching items':'The hold is empty'}</h3><p>${s.inventory.length?'Try another search or clear your filters.':'Add your first item below.'}</p>${s.inventory.length?'<button id="clear-cargo">Clear filters</button>':''}</div>`:
  `<div class="cargo-list">${items.map(i=>`<article class="cargo-entry"><div class="cargo-name"><h3>${escape(i.name)}</h3><span class="subtle">${escape(i.category)} · ${i.quantityUnit==='cargo unit'?'Quantity in CU':'Individual items'} · ${weightText(i.cargoUnits==null?null:i.quantity*i.cargoUnits)} total${i.personal?' · Personal: excluded from load':''}</span><p class="subtle">${escape(i.rarity??'Rarity unknown')} · ${marketText(i,i.quantity)} total retail reference${i.cargoUnits==null?' · Needs cargo-unit review':''}</p></div>
  <div class="cargo-quantity"><span class="subtle">In stores</span><strong>${i.quantity.toLocaleString()}</strong></div>
  <div class="cargo-adjust"><button data-item="${i.id}" data-delta="-1" aria-label="Remove one ${escape(i.name)}" ${i.quantity<1?'disabled':''}>− 1</button><button data-item="${i.id}" data-delta="1" aria-label="Add one ${escape(i.name)}">+ 1</button><button data-item="${i.id}" data-delta="10" aria-label="Add ten ${escape(i.name)}">+ 10</button></div>
  <button class="danger cargo-remove" data-remove-item="${i.id}" aria-label="Remove ${escape(i.name)} from inventory">Remove item</button>
  <details class="cargo-transfer"><summary>Edit / classify cargo</summary><form class="item-edit-form cargo-editor" data-edit-item="${escape(i.id)}">${cargoEditor(i,escape)}<button>Save item</button></form></details>
  ${ships.length>1?`<details class="cargo-transfer"><summary>Transfer to another vessel</summary><div class="actions"><label>Transfer amount<input id="transfer-qty-${i.id}" type="number" min="${i.quantityUnit==='cargo unit'?'0':'1'}" step="${i.quantityUnit==='cargo unit'?'any':'1'}" max="${i.quantity}" value="${Math.min(1,i.quantity)}"></label><select id="transfer-to-${i.id}" aria-label="Transfer destination for ${escape(i.name)}">${ships.filter(v=>v.id!==s.id).map(v=>`<option value="${v.id}">${escape(v.name)}</option>`).join('')}</select><button data-transfer="${i.id}">Transfer</button></div></details>`:''}</article>`).join('')}</div>`}`;
}
export function cargoView(s,ships,filters,escape,canUndo) {
  return `<div class="panel-heading"><div><p class="eyebrow">${escape(s.name)} / HOLD</p><h2>Vessel inventory</h2></div><button id="cargo-undo" ${canUndo?'':'disabled'}>Undo last action</button></div>
  ${loadPanel(s,escape)}<div class="cargo-toolbar"><label class="cargo-search">Search inventory<input id="cargo-search" type="search" placeholder="Find an item…" value="${escape(filters.query)}"></label>
  <label>Category<select id="cargo-category"><option value="">All categories</option>${[...new Set([...categories,...s.inventory.map(i=>i.category)])].map(c=>`<option ${filters.category===c?'selected':''}>${escape(c)}</option>`).join('')}</select></label>
  <label>Rarity<select id="cargo-rarity"><option value="">All rarities</option>${['Common','Uncommon','Rare'].map(r=>`<option ${filters.rarity===r?'selected':''}>${r}</option>`).join('')}</select></label><label>Stock<select id="cargo-stock"><option value="all" ${filters.stock==='all'?'selected':''}>All stock</option><option value="available" ${filters.stock==='available'?'selected':''}>In stock</option><option value="empty" ${filters.stock==='empty'?'selected':''}>Out of stock</option></select></label>
  <label>Sort by<select id="cargo-sort"><option value="value-density" ${filters.sort==='value-density'?'selected':''}>Retail value per CU</option><option value="name" ${filters.sort==='name'?'selected':''}>Name A–Z</option><option value="category" ${filters.sort==='category'?'selected':''}>Category</option><option value="quantity" ${filters.sort==='quantity'?'selected':''}>Quantity: high to low</option></select></label></div>
  <div id="cargo-results">${cargoResults(s,ships,filters,escape)}</div>
  <details class="cargo-add"><summary>Add cargo from catalogue or custom item</summary><form id="item-form" class="cargo-editor">${cargoEditor({quantity:1,category:'Equipment',quantityUnit:'item'},escape)}<button class="primary">Add item</button></form></details>
  <p class="subtle">Prices are new-goods retail references, not promised resale proceeds. Bulk goods are priced per CU; items and ammunition per piece or round. Catalogue rarity follows the GM's coloured tables. Spare guns in cargo do not install themselves into gun slots.</p>
  <p class="subtle">Removing an item removes its entire stored quantity. Undo restores it. Loaded cannon rounds are unaffected.</p>`;
}
