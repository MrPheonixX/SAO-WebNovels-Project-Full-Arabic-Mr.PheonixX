import { lazy, type ComponentType } from "react";

const KEY = "sao-chunk-retry";

// After a new deployment, a page that is already open (or an old cached
// index.html) may ask for a script file that no longer exists. Reloading once
// fetches the new files; if it still fails, the error is shown instead of looping.
export function lazyRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      try {
        sessionStorage.removeItem(KEY);
      } catch {
        /* storage unavailable */
      }
      return mod;
    } catch (err) {
      let firstTry = true;
      try {
        firstTry = sessionStorage.getItem(KEY) !== "1";
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* storage unavailable: do not risk a reload loop */
        firstTry = false;
      }
      if (firstTry) {
        window.location.reload();
        return new Promise<never>(() => {}); // wait for the reload
      }
      throw err;
    }
  });
}
