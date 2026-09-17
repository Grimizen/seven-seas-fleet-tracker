import test from 'node:test';
import assert from 'node:assert/strict';

test('broadside audio staggers a bounded volley, respects volume, and mute stops pending voices',async()=>{
  const started=[],levels=[],sources=[];
  const oldWindow=globalThis.window,oldStorage=globalThis.localStorage,oldFetch=globalThis.fetch;
  class AudioContext {
    state='running';currentTime=10;destination={};
    createGain(){const node={gain:{value:1},connect(){},disconnect(){}};levels.push(node);return node;}
    decodeAudioData(){return Promise.resolve({});}
    createBufferSource(){const source={connect(){},disconnect(){},start(t){started.push(t);},stop(){this.stopped=true;this.onended?.();}};sources.push(source);return source;}
  }
  try{
    globalThis.window={AudioContext};globalThis.localStorage={getItem:()=>null,setItem(){}};
    globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});
    const sound=await import('../dist/sound.js');sound.unlockSound();await sound.playSound('broadside',3);
    assert.equal(started.length,3);assert.ok(Math.abs(started[1]-started[0]-.14)<1e-9);
    assert.equal(levels[0].gain.value,.35);assert.equal(levels[1].gain.value,1/3);
    sound.setSoundSettings({enabled:false});assert.ok(sources.every(s=>s.stopped));
    await sound.playSound('broadside',3);assert.equal(started.length,3);
    sound.setSoundSettings({enabled:true,volume:.2});await sound.playSound('broadside',100);
    assert.equal(started.length,11);assert.equal(levels[0].gain.value,.2);
    sound.setSoundSettings({enabled:false});
  }finally{globalThis.window=oldWindow;globalThis.localStorage=oldStorage;globalThis.fetch=oldFetch;}
});
