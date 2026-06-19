import Image from "next/image";
import { cn } from "../../lib/utils";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  light?: boolean;
  className?: string;
}

/** NoLoop infinity-loop mark + wordmark (navy → teal gradient). */
export default function Logo({
  size = 32,
  showWordmark = true,
  light = false,
  className,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 shrink-0", className)}>
      <div
        className="rounded-lg bg-white flex items-center justify-center p-1 shadow-sm border border-sky-100"
        style={{ width: size, height: size }}
      >
        <Image
          src="/noloop-mark.svg"
          alt="NoLoop"
          width={size - 10}
          height={Math.round((size - 10) * 0.625)}
          priority
        />
      </div>
      {showWordmark && (
        <span
          className={cn(
            "font-black tracking-tight leading-none select-none",
            light ? "text-white" : "text-[#0F4C81]",
          )}
          style={{ fontSize: size * 0.5 }}
        >
          NoLoop
        </span>
      )}
    </div>
  );
}
