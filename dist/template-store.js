import {validateTemplate,templateKey} from './templates.js';
import {equal} from './shared-model.js';

export function saveTemplateEntry(items,template,original,id){
  validateTemplate(template);
  const index=original?items.findIndex(t=>templateKey(t)===templateKey(original)):-1;
  if(original&&(index<0||!equal(items[index],original)))throw Error('This template changed or was removed. Select it again before saving.');
  if(items.some((t,i)=>i!==index&&t.type.toLowerCase()===template.type.toLowerCase()))throw Error('A group template already has this name. Edit that template or choose another name.');
  const next=structuredClone(items),value={...(original?.maxLoad!==undefined?{maxLoad:original.maxLoad}:{}),...structuredClone(template),id};
  if(index<0){if(next.length>=50)throw Error('Up to 50 templates may be saved.');next.push(value);}else next[index]=value;
  return next;
}
export function deleteTemplateEntry(items,original){
  const existing=items.find(t=>templateKey(t)===templateKey(original));
  if(!existing||!equal(existing,original))throw Error('This template changed. Review it again before deleting.');
  return items.filter(t=>templateKey(t)!==templateKey(original));
}
