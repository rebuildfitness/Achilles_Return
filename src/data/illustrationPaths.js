// Presentation only. Never consumed by prescription, eligibility or persistence.
export function illustrationUrl(record, base = "./", thumbnail = false) {
  const path = thumbnail ? record?.thumbnailPath : record?.assetPath;
  if (record?.assetStatus !== "generated" ||
      !/^\/assets\/exercises\/[a-z0-9/-]+\.png$/.test(path || "")) return null;
  return `${base.endsWith("/") ? base : base + "/"}${path.slice(1)}`;
}
