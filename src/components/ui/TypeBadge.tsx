import type { OrgType } from "@/types";

/**
 * HOSPITAL/INSURER pill.
 * `size="sm"` (default) matches the table cells; `size="md"` matches the
 * larger org-detail header badge.
 */
export default function TypeBadge({
  type,
  size = "sm",
}: {
  type: OrgType;
  size?: "sm" | "md";
}) {
  const padding = size === "md" ? "px-2.5 py-1" : "px-2 py-0.5";
  const tint =
    type === "HOSPITAL"
      ? "bg-sky-100 text-sky-700"
      : "bg-teal-100 text-teal-700";
  return (
    <span className={`text-xs font-bold ${padding} rounded-full ${tint}`}>
      {type}
    </span>
  );
}
