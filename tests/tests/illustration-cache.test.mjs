import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const template=await readFile(new URL('../sw.js',import.meta.url),'utf8');
function worker(fetcher){
 const handlers={}, saved=new Map();let writes=0;
 const scope='https://example.org/Achilles_Return/';
 const cache={match:async req=>saved.get(req.url||req),put:async(req,res)=>{writes++;saved.set(req.url,res);}};
 vm.runInNewContext(template.replace('__BUILD_ID__','test').replace('__CORE_ASSETS__','["./index.html"]').replace('__ILLUSTRATION_ASSETS__','["./assets/exercises/strength-library/test.png"]'),{self:{registration:{scope},addEventListener:(name,fn)=>handlers[name]=fn},URL,Set,caches:{open:async()=>cache},fetch:fetcher});
 return {saved,get writes(){return writes;},request:async(url=scope+'assets/exercises/strength-library/test.png')=>{let response;handlers.fetch({request:{url,method:'GET'},respondWith:p=>response=p,waitUntil:()=>{}});return response;}};
}
test('local illustration is fetched once then reused offline',async()=>{
 let calls=0;const w=worker(async()=>{calls++;if(calls>1)throw Error('offline');return new Response('image',{headers:{'content-type':'image/png'}});});
 assert.equal(await (await w.request()).text(),'image');
 assert.equal(await (await w.request()).text(),'image');assert.equal(calls,1);assert.equal(w.writes,1);
});
test('failed and non-image responses are not cached; external demos are not intercepted',async()=>{
 for(const response of [new Response('missing',{status:404}),new Response('html',{headers:{'content-type':'text/html'}})]){
  const w=worker(async()=>response);await w.request();assert.equal(w.writes,0);
  assert.equal(await w.request('https://youtube.com/watch?v=demo'),undefined);
 }
});
