// src/components/Pages/Management/reportUtils.js
export const formatDuration = (secondsRaw) => {
  const seconds = Math.round(Number(secondsRaw) || 0);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
};

export const pct = (v) => `${Number(v || 0).toFixed(1)}%`;
