import { describe, it, expect } from "vitest";
import * as store from "./workStatus";

function makeStorage(initial: Record<string, string> = {}) {
  const m = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
  };
}
function setFetch(rows: any[] | "fail") {
  (globalThis as any).fetch = async () =>
    rows === "fail"
      ? { ok: false, status: 500, text: async () => "" }
      : { ok: true, status: 200, text: async () => JSON.stringify(rows) };
}

// Each test starts from a clean in-memory state seeded from the browser cache.
async function fresh(cache?: Record<string, string>) {
  (globalThis as any).localStorage = makeStorage(cache ? { "sao-work-status": JSON.stringify(cache) } : {});
  store.__resetWorkStatusesForTests();
  return store;
}

describe("work status store", () => {
  it("defaults to published and ignores junk in the cache", async () => {
    const m = await fresh({ a: "hidden", b: "nonsense" });
    expect(m.getWorkStatus("a")).toBe("hidden");
    expect(m.getWorkStatus("b")).toBe("published");
    expect(m.getWorkStatus("unknown")).toBe("published");
  });
  it("loads from the server, replaces the cache and notifies", async () => {
    const m = await fresh({ old: "hidden" });
    setFetch([{ work_id: "n", status: "draft" }]);
    await m.loadWorkStatuses();
    expect(m.getWorkStatus("n")).toBe("draft");
    expect(m.getWorkStatus("old")).toBe("published");
    expect(JSON.parse(localStorage.getItem("sao-work-status")!)).toEqual({ n: "draft" });
  });
  it("keeps the cached copy when the server is unreachable", async () => {
    const m = await fresh({ a: "hidden" });
    setFetch("fail");
    await m.loadWorkStatuses();
    expect(m.getWorkStatus("a")).toBe("hidden");
  });
  it("admin changes apply immediately; publishing removes the entry", async () => {
    const m = await fresh();
    m.setLocalWorkStatus("x", "hidden");
    expect(m.getWorkStatus("x")).toBe("hidden");
    m.setLocalWorkStatus("x", "published");
    expect(m.getWorkStatus("x")).toBe("published");
    expect(JSON.parse(localStorage.getItem("sao-work-status")!)).toEqual({});
  });
});
