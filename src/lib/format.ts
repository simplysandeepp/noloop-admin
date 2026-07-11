// Formatting helpers shared across pages.

/** Render an ISO timestamp in the viewer's locale. */
export function fmtDate(s: string): string {
  return new Date(s).toLocaleString();
}
