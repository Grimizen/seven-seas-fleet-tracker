import {sounds} from './sound-events.js';
const key='seven-seas-audio';
let settings={enabled:true,volume:.35};
try{const value=JSON.parse(localStorage.getItem(key));if(value){settings.enabled=value.enabled!==false;settings.volume=Math.max(0,Math.min(1,Number(value.volume)||0));}}catch{}
let context,gain,latest=0;const buffers=new Map(),active=new Set();
export const soundSettings=()=>({...settings});
export function setSoundSettings(value){Object.assign(settings,value);settings.volume=Math.max(0,Math.min(1,settings.volume));try{localStorage.setItem(key,JSON.stringify(settings));}catch{}if(gain)gain.gain.value=settings.enabled?settings.volume:0;if(!settings.enabled)for(const source of active){try{source.stop();}catch{}}}
export function unlockSound(){
  if(!settings.enabled)return;
  try{if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context=new Audio();gain=context.createGain();gain.connect(context.destination);gain.gain.value=settings.volume;}if(context.state==='suspended')context.resume().catch(()=>{});}catch{}
}
async function buffer(name){if(!buffers.has(name))buffers.set(name,fetch(new URL(`audio/${name}.mp3`,import.meta.url)).then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();}).then(b=>context.decodeAudioData(b)).catch(e=>{buffers.delete(name);throw e;}));return buffers.get(name);}
export async function playSound(event,count=4){
  if(!settings.enabled||!sounds[event]||!context)return;
  const request=++latest,list=sounds[event],name=list[Math.floor(Math.random()*list.length)];
  try{const volley=event==='broadside',voices=volley?Math.max(1,Math.min(8,Number(count)||4)):1;
    const clips=await Promise.all(Array.from({length:voices},(_,i)=>buffer(volley?list[i%list.length]:name)));
    if(!settings.enabled||request!==latest||context.state!=='running')return;
    for(const source of active){try{source.stop();}catch{}}
    const start=context.currentTime+.02;
    clips.forEach((audio,i)=>{const source=context.createBufferSource(),level=context.createGain();
      source.buffer=audio;level.gain.value=1/voices;source.connect(level);level.connect(gain);
      source.onended=()=>{active.delete(source);source.disconnect();level.disconnect();};active.add(source);
      source.start(start+(volley?i*.14:0));
    });
  }catch{/* Sound is optional; failures never affect a saved gameplay action. */}
}
