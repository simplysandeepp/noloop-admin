import { KeyRound, X } from "lucide-react";

interface CredentialsCardProps {
  title: string;
  email: string;
  password: string;
  /** Shown only when provided. */
  role?: string;
  /** Grid columns for the detail list (matches each call site's layout). */
  columns: 2 | 3;
  onClose: () => void;
  /** Wrapper margin utility — call sites use mb-4 / mt-4 / mt-5. */
  className?: string;
}

/** Green "save these now" card showing one-time generated credentials. */
export default function CredentialsCard({
  title,
  email,
  password,
  role,
  columns,
  onClose,
  className = "",
}: CredentialsCardProps) {
  const cols = columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div
      className={`${className} rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-800 font-bold">
          <KeyRound className="w-4 h-4" /> {title}
        </div>
        <button
          onClick={onClose}
          className="text-emerald-700 hover:text-emerald-900"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-emerald-700 mt-1">
        Save these now — the password is shown once.
      </p>
      <dl className={`mt-3 grid ${cols} gap-3 text-sm`}>
        <div>
          <dt className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">
            Email
          </dt>
          <dd className="font-mono text-slate-800 break-all">{email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">
            Password
          </dt>
          <dd className="font-mono text-slate-800 break-all">{password}</dd>
        </div>
        {role && (
          <div>
            <dt className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">
              Role
            </dt>
            <dd className="font-mono text-slate-800">{role}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
