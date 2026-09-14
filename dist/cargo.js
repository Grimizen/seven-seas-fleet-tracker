export const categories = ['Equipment','Misc','Quest','Rations','Repair','Ammunition','Trade Goods'];
export function filteredInventory(items, filters) {
  const query = filters.query.trim().toLocaleLowerCase();
  return items.filter(item => (!query || `${item.name} ${item.category}`.toLocaleLowerCase().includes(query))
    && (!filters.category || item.category === filters.category)
    && (filters.stock !== 'available' || item.quantity > 0)
    && (filters.stock !== 'empty' || item.quantity === 0))
    .sort((a,b) => filters.sort === 'quantity' ? b.quantity-a.quantity || a.name.localeCompare(b.name)
      : filters.sort === 'category' ? a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name));
}
export function cargoResults(s,ships,filters,escape) {
  const items=filteredInventory(s.inventory,filters);
  return `<p class="subtle" role="status">${items.length} of ${s.inventory.length} items · ${s.guns.filter(g=>g.loaded).length} rounds loaded separately</p>
  ${!items.length?`<div class="cargo-empty"><h3>${s.inventory.length?'No matching items':'The hold is empty'}</h3><p>${s.inventory.length?'Try another search or clear your filters.':'Add your first item below.'}</p>${s.inventory.length?'<button id="clear-cargo">Clear filters</button>':''}</div>`:
  `<div class="cargo-list">${items.map(i=>`<article class="cargo-entry"><div class="cargo-name"><h3>${escape(i.name)}</h3><span class="subtle">${escape(i.category)}</span></div>
  <div class="cargo-quantity"><span class="subtle">In stores</span><strong>${i.quantity.toLocaleString()}</strong></div>
  <div class="cargo-adjust"><button data-item="${i.id}" data-delta="-1" aria-label="Remove one ${escape(i.name)}" ${i.quantity===0?'disabled':''}>− 1</button><button data-item="${i.id}" data-delta="1" aria-label="Add one ${escape(i.name)}">+ 1</button><button data-item="${i.id}" data-delta="10" aria-label="Add ten ${escape(i.name)}">+ 10</button></div>
  <button class="danger cargo-remove" data-remove-item="${i.id}" aria-label="Remove ${escape(i.name)} from inventory">Remove item</button>
  ${ships.length>1?`<details class="cargo-transfer"><summary>Transfer to another vessel</summary><div class="actions"><label>Transfer amount<input id="transfer-qty-${i.id}" type="number" min="1" max="${i.quantity}" value="1"></label><select id="transfer-to-${i.id}" aria-label="Transfer destination for ${escape(i.name)}">${ships.filter(v=>v.id!==s.id).map(v=>`<option value="${v.id}">${escape(v.name)}</option>`).join('')}</select><button data-transfer="${i.id}">Transfer</button></div></details>`:''}</article>`).join('')}</div>`}`;
}
export function cargoView(s,ships,filters,escape,canUndo) {
  return `<div class="panel-heading"><div><p class="eyebrow">${escape(s.name)} / HOLD</p><h2>Vessel inventory</h2></div><button id="cargo-undo" ${canUndo?'':'disabled'}>Undo last action</button></div>
  <div class="cargo-toolbar"><label class="cargo-search">Search inventory<input id="cargo-search" type="search" placeholder="Find an item…" value="${escape(filters.query)}"></label>
  <label>Category<select id="cargo-category"><option value="">All categories</option>${[...new Set([...categories,...s.inventory.map(i=>i.category)])].map(c=>`<option ${filters.category===c?'selected':''}>${escape(c)}</option>`).join('')}</select></label>
  <label>Stock<select id="cargo-stock"><option value="all" ${filters.stock==='all'?'selected':''}>All stock</option><option value="available" ${filters.stock==='available'?'selected':''}>In stock</option><option value="empty" ${filters.stock==='empty'?'selected':''}>Out of stock</option></select></label>
  <label>Sort by<select id="cargo-sort"><option value="name" ${filters.sort==='name'?'selected':''}>Name A–Z</option><option value="category" ${filters.sort==='category'?'selected':''}>Category</option><option value="quantity" ${filters.sort==='quantity'?'selected':''}>Quantity: high to low</option></select></label></div>
  <div id="cargo-results">${cargoResults(s,ships,filters,escape)}</div>
  <details class="cargo-add"><summary>Add an item</summary><form id="item-form" class="cargo-add-form"><label>Item name<input id="item-name" required maxlength="80" placeholder="e.g. Repair timber"></label><label>Category<select id="item-category">${categories.map(n=>`<option>${n}</option>`).join('')}</select></label><label>Quantity<input id="item-quantity" required type="number" min="1" step="1" value="1"></label><button class="primary">Add item</button></form></details>
  <p class="subtle">Removing an item removes its entire stored quantity. Undo restores it. Loaded cannon rounds are unaffected.</p>`;
}
