import { useMemo, useSyncExternalStore } from "react";
import {
  getSessionSnapshot,
  subscribeSession,
  userFromSnapshot,
  type CloudUser,
} from "./cloud";

/** The signed-in reader (or null). Updates when the reader signs in or out, in any tab. */
export function useAuthUser(): CloudUser | null {
  const raw = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => null);
  return useMemo(() => userFromSnapshot(raw), [raw]);
}
