import { describe, it, expect } from "vitest";
import {
  adminSetUserStatus,
  deleteReview,
  fetchReviews,
  submitReview,
  summarizeReviews,
  adminSetWorkStatus,
  fetchWorkStatuses,
  getSessionUser,
  isAdmin,
  noteWorkOpened,
  parseRecoveryHash,
  recordWorkView,
  signIn,
  signOut,
  signUp,
  syncProgress,
} from "./cloud";

// ---- tiny browser stand-ins ----
function makeStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
  };
}
type Call = { url: string; method: string; headers: Record<string, string>; body: any };
function install(responder: (c: Call) => { status?: number; json?: unknown }) {
  const calls: Call[] = [];
  (globalThis as any).localStorage = makeStorage();
  (globalThis as any).sessionStorage = makeStorage();
  (globalThis as any).fetch = async (url: string, init: any = {}) => {
    const call: Call = {
      url,
      method: init.method ?? "GET",
      headers: init.headers ?? {},
      body: init.body ? JSON.parse(init.body) : undefined,
    };
    calls.push(call);
    const r = responder(call);
    const status = r.status ?? 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => (r.json === undefined ? "" : JSON.stringify(r.json)),
    };
  };
  return calls;
}
const session = (extra: any = {}) => ({
  access_token: "ACCESS",
  refresh_token: "REFRESH",
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id: "u1", email: "me@x.com", user_metadata: { display_name: "Kirito" } },
  ...extra,
});

describe("sign in / up / out", () => {
  it("signs in, stores the session and creates the profile with the user's token", async () => {
    const calls = install((c) =>
      c.url.includes("/auth/v1/token") ? { json: session() } : { status: 201 },
    );
    const r = await signIn(" me@x.com ", "secret1");
    expect(r.ok).toBe(true);
    expect(getSessionUser()?.name).toBe("Kirito");
    const profile = calls.find((c) => c.url.includes("sao_profiles") && c.method === "POST")!;
    expect(profile.headers["Authorization"]).toBe("Bearer ACCESS");
    expect(String(profile.headers["Prefer"]).includes("ignore-duplicates")).toBe(true);
    expect(calls[0].body.email).toBe("me@x.com");
  });
  it("shows a friendly message and stores nothing on a wrong password", async () => {
    install(() => ({ status: 400, json: { error_description: "Invalid login credentials" } }));
    const r = await signIn("me@x.com", "bad");
    expect(r.ok).toBe(false);
    expect(r.ok ? "" : r.error).toBe("البريد أو كلمة المرور غير صحيحة");
    expect(getSessionUser()).toBe(null);
  });
  it("sign-up without a session (e-mail confirmation on) returns null and stores nothing", async () => {
    install(() => ({ json: { id: "u2", email: "n@x.com" } }));
    const r = await signUp("n@x.com", "secret1", "Asuna");
    expect(r.ok && r.data === null).toBe(true);
    expect(getSessionUser()).toBe(null);
  });
  it("sign-out clears the session and the cached profile", async () => {
    install((c) => (c.url.includes("/auth/v1/token") ? { json: session() } : { status: 204 }));
    await signIn("me@x.com", "secret1");
    localStorage.setItem("user-profile", "{}");
    await signOut();
    expect(getSessionUser()).toBe(null);
    expect(localStorage.getItem("user-profile")).toBe(null);
  });
});

describe("token refresh", () => {
  it("refreshes an expired access token before calling the data API", async () => {
    const calls = install((c) => {
      if (c.url.includes("grant_type=refresh_token")) return { json: session({ access_token: "NEW" }) };
      return { json: [] };
    });
    localStorage.setItem(
      "sao-cloud-session",
      JSON.stringify({ access_token: "OLD", refresh_token: "REFRESH", expires_at: 1, user: { id: "u1", email: "me@x.com", name: "K" } }),
    );
    await isAdmin();
    expect(calls[0].url.includes("grant_type=refresh_token")).toBe(true);
    expect(calls[1].headers["Authorization"]).toBe("Bearer NEW");
  });
});

describe("admin check", () => {
  it("is true only when the database returns the user's sao_admins row", async () => {
    install((c) =>
      c.url.includes("/auth/v1/token")
        ? { json: session() }
        : c.url.includes("sao_admins")
          ? { json: [{ user_id: "u1" }] }
          : { status: 201 },
    );
    await signIn("me@x.com", "secret1");
    expect(await isAdmin()).toBe(true);
  });
  it("is false for a normal user and when signed out", async () => {
    install((c) =>
      c.url.includes("/auth/v1/token") ? { json: session() } : c.url.includes("sao_admins") ? { json: [] } : { status: 201 },
    );
    expect(await isAdmin()).toBe(false);
    await signIn("me@x.com", "secret1");
    expect(await isAdmin()).toBe(false);
  });
  it("ban/unban goes through the admin-only RPC", async () => {
    const calls = install((c) => (c.url.includes("/auth/v1/token") ? { json: session() } : { status: 204 }));
    await signIn("me@x.com", "secret1");
    const r = await adminSetUserStatus("u9", "banned");
    expect(r.ok).toBe(true);
    const rpc = calls.find((c) => c.url.includes("rpc/sao_set_user_status"))!;
    expect(rpc.body).toEqual({ p_user: "u9", p_status: "banned" });
  });
});

describe("recovery link", () => {
  it("extracts the token only from a recovery hash", () => {
    expect(parseRecoveryHash("#access_token=abc&type=recovery&x=1")).toBe("abc");
    expect(parseRecoveryHash("#access_token=abc&type=signup")).toBe(null);
    expect(parseRecoveryHash("")).toBe(null);
  });
});

describe("view counter", () => {
  it("counts once per work per session, anonymously, and ignores bad ids", async () => {
    const calls = install(() => ({ status: 204 }));
    await recordWorkView("sao-volume-1");
    await recordWorkView("sao-volume-1");
    await recordWorkView("../evil");
    expect(calls.length).toBe(1);
    expect(calls[0].url.includes("rpc/sao_record_view")).toBe(true);
    expect(calls[0].headers["Authorization"].startsWith("Bearer eyJ")).toBe(true);
    expect(calls[0].body).toEqual({ p_work_id: "sao-volume-1" });
  });
});

describe("reading history sync", () => {
  it("pulls newer online history", async () => {
    install((c) =>
      c.url.includes("/auth/v1/token")
        ? { json: session() }
        : c.url.includes("select=data,updated_at")
          ? { json: [{ data: { works: { a: { lastOpened: "2030-01-01T00:00:00Z", opens: 3 } } }, updated_at: "2030-01-01T00:00:00Z" }] }
          : { status: 201 },
    );
    await signIn("me@x.com", "secret1");
    expect(await syncProgress()).toBe("pulled");
    expect(JSON.parse(localStorage.getItem("sao-progress")!).works.a.opens).toBe(3);
  });
  it("pushes this device's history when it is newer", async () => {
    const calls = install((c) =>
      c.url.includes("/auth/v1/token") ? { json: session() } : c.url.includes("select=data,updated_at") ? { json: [] } : { status: 201 },
    );
    await signIn("me@x.com", "secret1");
    noteWorkOpened("b");
    expect(await syncProgress()).toBe("pushed");
    const push = calls.filter((c) => c.url.includes("sao_progress?on_conflict")).pop()!;
    expect(push.body.user_id).toBe("u1");
    expect(push.body.data.works.b.opens).toBe(1);
  });
});

describe("work visibility", () => {
  it("reads statuses anonymously and keeps only draft/hidden", async () => {
    const calls = install(() => ({
      json: [
        { work_id: "a", status: "hidden" },
        { work_id: "b", status: "draft" },
        { work_id: "c", status: "published" },
        { work_id: "d", status: "weird" },
      ],
    }));
    const r = await fetchWorkStatuses();
    expect(r.ok ? r.data : null).toEqual({ a: "hidden", b: "draft" });
    expect(calls[0].headers["Authorization"].startsWith("Bearer eyJ")).toBe(true);
  });
  it("saving a status goes through the admin-only RPC", async () => {
    const calls = install((c) => (c.url.includes("/auth/v1/token") ? { json: session() } : { status: 204 }));
    await signIn("me@x.com", "secret1");
    const r = await adminSetWorkStatus("sao-volume-1", "hidden");
    expect(r.ok).toBe(true);
    const rpc = calls.find((c) => c.url.includes("rpc/sao_set_work_status"))!;
    expect(rpc.body).toEqual({ p_work_id: "sao-volume-1", p_status: "hidden" });
    expect(rpc.headers["Authorization"]).toBe("Bearer ACCESS");
  });
  it("reports failure when the database refuses (not an admin)", async () => {
    install((c) => (c.url.includes("/auth/v1/token") ? { json: session() } : { status: 403 }));
    await signIn("me@x.com", "secret1");
    const r = await adminSetWorkStatus("x", "draft");
    expect(r.ok).toBe(false);
  });
});

describe("reviews", () => {
  const row = (o: any = {}) => ({ id: "11111111-1111-1111-1111-111111111111", user_id: "u1", author: "Kirito", stars: 4, comment: "great", created_at: "2026-01-01T00:00:00Z", ...o });
  it("reads reviews anonymously and averages them", async () => {
    const calls = install(() => ({ json: [row(), row({ id: "2", stars: 5, user_id: "u2" })] }));
    const r = await fetchReviews("sao-volume-1");
    expect(r.ok && r.data.length === 2).toBe(true);
    expect(calls[0].headers["Authorization"].startsWith("Bearer eyJ")).toBe(true);
    expect(summarizeReviews(r.ok ? r.data : [])).toEqual({ count: 2, average: 4.5 });
    expect(summarizeReviews([])).toEqual({ count: 0, average: 0 });
  });
  it("rejects a bad work id before any request", async () => {
    const calls = install(() => ({ json: [] }));
    const r = await fetchReviews("../x");
    expect(r.ok).toBe(false);
    expect(calls.length).toBe(0);
  });
  it("updates the reader's existing review instead of creating a second one", async () => {
    const calls = install((c) =>
      c.url.includes("/auth/v1/token") ? { json: session() } : c.method === "PATCH" ? { json: [row()] } : { status: 201 },
    );
    await signIn("me@x.com", "secret1");
    const r = await submitReview("w1", 5, "  nice  ");
    expect(r.ok).toBe(true);
    const patch = calls.find((c) => c.method === "PATCH" && c.url.includes("sao_reviews"))!;
    expect(patch.url.includes("work_id=eq.w1&user_id=eq.u1")).toBe(true);
    expect(patch.body).toEqual({ stars: 5, comment: "nice" });
    expect(calls.some((c) => c.method === "POST" && c.url.includes("sao_reviews"))).toBe(false);
  });
  it("creates the review when none exists yet, and sends no author (the database sets it)", async () => {
    const calls = install((c) =>
      c.url.includes("/auth/v1/token") ? { json: session() } : c.method === "PATCH" ? { json: [] } : { status: 201 },
    );
    await signIn("me@x.com", "secret1");
    const r = await submitReview("w1", 3, "");
    expect(r.ok).toBe(true);
    const post = calls.filter((c) => c.method === "POST" && c.url.endsWith("/rest/v1/sao_reviews")).pop()!;
    expect(post.body).toEqual({ work_id: "w1", user_id: "u1", stars: 3, comment: null });
  });
  it("validates stars and requires a session", async () => {
    install(() => ({ status: 204 }));
    expect((await submitReview("w1", 5, "x")).ok).toBe(false); // signed out
    install((c) => (c.url.includes("/auth/v1/token") ? { json: session() } : { status: 201 }));
    await signIn("me@x.com", "secret1");
    expect((await submitReview("w1", 0, "x")).ok).toBe(false);
    expect((await submitReview("w1", 6, "x")).ok).toBe(false);
  });
  it("deletes by id only", async () => {
    const calls = install((c) => (c.url.includes("/auth/v1/token") ? { json: session() } : { status: 204 }));
    await signIn("me@x.com", "secret1");
    expect((await deleteReview("not-an-id")).ok).toBe(false);
    expect((await deleteReview("11111111-1111-1111-1111-111111111111")).ok).toBe(true);
    expect(calls.some((c) => c.method === "DELETE")).toBe(true);
  });
});
