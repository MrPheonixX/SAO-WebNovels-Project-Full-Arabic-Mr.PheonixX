// Which works are visible to readers. The admin panel writes this to Supabase
// (table sao_work_status); every visitor reads it once at start-up. A copy is
// kept in localStorage so repeat visitors get the right answer instantly and
// offline. No row means "published".
//
// NOTE: this controls what the site LISTS and OPENS. It does not protect the PDF
// files themselves: anyone who knows a file's GitHub URL can still download it.
import { useSyncExternalStore } from "react";
import { cloudEnabled, fetchWorkStatuses, type WorkStatus } from "./cloud";

const CACHE_KEY = "sao-work-status";

function readCache(): Record<string, WorkStatus> {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
    const out: Record<string, WorkStatus> = {};
    for (const [id, st] of Object.entries(parsed ?? {})) {
      if (st === "draft" || st === "hidden") out[id] = st;
    }
    return out;
  } catch {
    return {};
  }
}

function persist() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(statuses));
  } catch {
    /* storage unavailable */
  }
}

let statuses: Record<string, WorkStatus> = readCache();
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  listeners.forEach((l) => l());
}

export const getWorkStatus = (id: string): WorkStatus => statuses[id] ?? "published";

/** Admin panel: reflect a change that was just saved on the server. */
export function setLocalWorkStatus(id: string, status: WorkStatus): void {
  const next = { ...statuses };
  if (status === "published") delete next[id];
  else next[id] = status;
  statuses = next;
  persist();
  emit();
}

/** Fetches the latest statuses. On failure the cached copy is kept. */
export async function loadWorkStatuses(): Promise<void> {
  if (!cloudEnabled) return;
  const r = await fetchWorkStatuses();
  if (!r.ok) return;
  statuses = r.data;
  persist();
  emit();
}

/** Test helper: start again from the browser cache, as on a fresh page load. */
export function __resetWorkStatusesForTests(): void {
  statuses = readCache();
  version = 0;
  listeners.clear();
}

/** Re-renders the calling component whenever statuses change. */
export function useWorkStatuses(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
    () => version,
  );
}
