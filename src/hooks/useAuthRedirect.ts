"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ApiError } from "@/lib/api";

/**
 * Returns a handler that redirects to `/login` when an error is an
 * authentication/authorization failure (401/403).
 *
 * @returns `handleAuthError(err)` — `true` if it handled the error (and
 *   redirected), `false` otherwise so the caller can surface the message.
 */
export function useAuthRedirect() {
  const router = useRouter();

  return useCallback(
    (err: unknown): boolean => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        router.replace("/login");
        return true;
      }
      return false;
    },
    [router],
  );
}
