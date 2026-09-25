// Navigation only. Never writes logs or changes a prescription.
export function guidedSetOrder(items, circuit = false) {
 const active=items.filter(ex=>!ex.skipReason && ex.sets>0);
 if(!circuit) return active.flatMap(ex=>Array.from({length:ex.sets},(_,index)=>({id:ex.id,index,block:ex.block || ''})));
 const blocks=[...new Set(active.map(ex=>ex.block || ''))];
 return blocks.flatMap(block=>{
  const exercises=active.filter(ex=>(ex.block || '')===block);
  return Array.from({length:Math.max(0,...exercises.map(ex=>ex.sets))},(_,index)=>exercises.filter(ex=>index<ex.sets).map(ex=>({id:ex.id,index,block}))).flat();
 });
}
export function nextGuidedSet(items,log={},circuit=false) {
 return guidedSetOrder(items,circuit).find(step=>!log[step.id]?.sets?.[step.index]?.complete) || null;
}
