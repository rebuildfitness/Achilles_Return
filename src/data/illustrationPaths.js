// Presentation only. Never consumed by prescription, eligibility or persistence.
export function illustrationUrl(record, base = "./") {
  if (record?.assetStatus !== "generated" ||
      !/^\/assets\/exercises\/[a-z0-9/-]+\.png$/.test(record.assetPath || "")) return null;
  return `${base.endsWith("/") ? base : base + "/"}${record.assetPath.slice(1)}`;
}
