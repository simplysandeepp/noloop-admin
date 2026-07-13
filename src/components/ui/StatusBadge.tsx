/** ACTIVE/REVOKED pill. Defaults to ACTIVE when status is absent. */
export default function StatusBadge({ status }: { status?: string }) {
  const s = status ?? "ACTIVE";
  const ok = s === "ACTIVE";
  return (
    <span
      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
        ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
      }`}
    >
      {s}
    </span>
  );
}
