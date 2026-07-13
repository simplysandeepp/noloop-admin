/**
 * Red inline error message. Pass a layout utility via `className`
 * (e.g. `mt-6`, `mt-4`, `sm:col-span-2`) to match each call site.
 */
export default function ErrorBanner({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${className} text-sm rounded-xl px-3.5 py-2.5 bg-red-50 text-red-600 border border-red-100`}
    >
      {children}
    </div>
  );
}
