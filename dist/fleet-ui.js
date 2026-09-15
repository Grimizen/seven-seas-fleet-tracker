import {templates} from './templates.js';
import {stationDefaults} from './model.js';

export function fleetControls(s,archived,custom,escape){
  const all=[...templates,...custom];
  return `<h2>Manage fleet</h2><p class="subtle">Owner and GM controls. Archived vessels keep their contents and can be restored.</p>
  <div class="card stack"><label>New vessel name<input id="new-name" maxlength="60" placeholder="Vessel name"></label><label>New vessel class<select id="new-class">${all.map((t,i)=>`<option value="${i}" ${i===2?'selected':''}>${escape(t.type)}${i>=templates.length?' · Group template':''}</option>`).join('')}</select></label><button id="load-templates">Load saved group templates</button><button id="new-ship" class="primary">Add vessel</button><p class="subtle">Starts at full HP with up to 16 crew and four loaded 9lb guns, limited by class capacity, and 30 total lead rounds. Adjust crew and supplies after creation.</p></div>
  ${s?`<div class="card stack"><label>Rename ${escape(s.name)}<input id="rename-name" value="${escape(s.name)}" maxlength="60"></label><button id="rename-ship">Save vessel name</button>
  <button id="archive-ship" class="danger">Remove vessel from fleet…</button></div>
  <div class="card stack"><h3>Vessel class</h3><label>Load class defaults<select id="template-select"><option value="">Current vessel settings</option>${all.map((t,i)=>`<option value="${i}">${escape(t.type)}</option>`).join('')}</select></label>
  <form id="class-form" class="stack"><label>Class / size name<input id="class-type" maxlength="60" required value="${escape(s.type)}"></label>
  ${[['maxHull','Hull HP',s.maxHull],['minCrew','Minimum crew',s.minCrew],['maxCrew','Crew capacity',s.maxCrew],['maxGuns','Gun capacity',s.maxGuns]].map(([key,label,value])=>`<label>${label}<input id="class-${key}" type="number" min="${key==='maxGuns'?0:1}" max="10000" step="1" required value="${value}"></label>`).join('')}
  <details><summary>Section HP maxima</summary>${Object.keys(stationDefaults).map((key,i)=>`<label>${key}<input data-section-max="${i}" type="number" min="1" max="10000" required value="${s.stations[key].max}"></label>`).join('')}</details>
  <p class="subtle">Changing class preserves damage as missing HP, and keeps destroyed sections at zero. Crew, cargo, officers and guns stay aboard. Resolve capacity conflicts first. Movement remains 6 / 9 / 12 hexes; other classes need GM adjudication.</p>
  <button type="submit" class="primary">Review class change…</button><button type="button" id="save-template">Save these defaults as a group template</button><p class="subtle">Saving the same class name replaces its template. Existing ships are unaffected until you apply it.</p></form></div>`:''}
  <div class="card stack"><h3>Archived vessels (${archived.length})</h3>${archived.length?archived.map(v=>`<div class="actions"><span>${escape(v.name)} · ${escape(v.type)}</span><button data-restore="${escape(v.id)}">Restore</button></div>`).join(''):'<p class="subtle">No archived vessels.</p>'}</div>`;
}
