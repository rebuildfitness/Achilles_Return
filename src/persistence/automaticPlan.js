import { get, put } from "../db.js";
// Content-addressed records make refresh/StrictMode idempotent and retain earlier explanations.
export async function saveAutomaticPlanAudit(snapshot) {
  const bytes = new TextEncoder().encode(JSON.stringify(snapshot));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
  const id = `automatic-plan-${snapshot.date}-${hash}`;
  if (!await get("decisions", id)) await put("decisions", { ...snapshot, id, createdAt: new Date().toISOString() });
  return id;
}
