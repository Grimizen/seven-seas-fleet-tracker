// Presentation only: never reorder the paired config/game gun arrays in storage.
export const compareText=(a,b)=>String(a??'').localeCompare(String(b??''),'en',{numeric:true,sensitivity:'base'})||String(a??'').localeCompare(String(b??''),'en');
export const compareNamed=(a,b)=>compareText(a.name,b.name)||compareText(a.id,b.id);
export const namedOrder=items=>[...items].sort(compareNamed);
export const officerEntries=officers=>Object.entries(officers).sort(([a],[b])=>compareText(a,b));
