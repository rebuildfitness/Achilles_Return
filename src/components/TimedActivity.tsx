import { useEffect, useState } from "react";
export function TimedActivity({storageKey, seconds, name}: {storageKey:string; seconds:number; name:string}) {
 const [deadline,setDeadline]=useState(()=>{try{return Number(sessionStorage.getItem(storageKey))||0;}catch{return 0;}});
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const tick=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(tick);},[]);
 function update(value:number){setDeadline(value);setNow(Date.now());try{sessionStorage.setItem(storageKey,String(value));}catch{/* Timer remains usable without storage. */}}
 const remaining=Math.max(0,Math.ceil((deadline-now)/1000));
 return <div className="rest-timer"><div><strong>{name} timer</strong><output aria-label={`${name} time remaining`}>{deadline ? `${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}` : `${seconds} sec planned`}</output><p className="helper">{deadline && !remaining ? "Timer finished. Record your actual time below." : "Timer does not record or complete a set. For a range, it starts at the lower prescribed time."}</p></div><div><button className="text-button" onClick={()=>update(Date.now()+seconds*1000)}>Start activity timer</button><button className="text-button" onClick={()=>update(0)}>Clear activity timer</button></div></div>;
}
