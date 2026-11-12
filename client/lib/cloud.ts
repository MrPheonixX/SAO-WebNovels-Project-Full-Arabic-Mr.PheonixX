// Supabase access for the static site: plain fetch, no SDK (an SDK would add a
// dependency, and a stale package-lock.json is exactly what breaks `npm ci`).
//
//   Auth    : /auth/v1   (e-mail + password, token refresh, password recovery)
//   Data    : /rest/v1   (tables prefixed sao_, protected by Row Level Security)
//
// Admin rights are NOT decided here. A user is an admin only if the database
// has a row for them in sao_admins; every admin-only read/write is enforced by
// RLS / security-definer functions on the server side (see supabase-sao.sql).
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./cloud-config";

export const cloudEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const SESSION_KEY = "sao-cloud-session";
const PROGRESS_KEY = "sao-progress";
const VIEW_SEEN_PREFIX = "sao-view-";

export interface CloudUser {
  id: string;
  email: string;
  name: string;
}
interface CloudSession {
  access_token: string;
  refresh_token: string;
  expires_at: number; // seconds since epoch
  user: CloudUser;
}
export type WorkStatus = "published" | "draft" | "hidden";
export type CloudResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

const ok = <T>(data: T): CloudResult<T> => ({ ok: true, data });
const fail = (error: string, status?: number): CloudResult<never> => ({
  ok: false,
  error,
  status,
});

// ---------- session storage ----------
function readSession(): CloudSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as CloudSession) : null;
  } catch {
    return null;
  }
}
function writeSession(s: CloudSession | null) {
  adminCache = null; // a different/ended session must re-check admin rights
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sao-auth"));
  }
}

export const getSessionUser = (): CloudUser | null =>
  cloudEnabled ? (readSession()?.user ?? null) : null;

function toSession(json: any): CloudSession {
  const meta = json.user?.user_metadata ?? {};
  const email: string = json.user?.email ?? "";
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at:
      json.expires_at ?? Math.floor(Date.now() / 1000) + (json.expires_in ?? 3600),
    user: {
      id: json.user.id,
      email,
      name: (meta.display_name as string) || email.split("@")[0],
    },
  };
}

// ---------- low-level requests ----------
function friendly(json: any, fallback: string): string {
  const raw: string = json?.error_description || json?.msg || json?.message || "";
  if (/invalid login credentials/i.test(raw)) return "البريد أو كلمة المرور غير صحيحة";
  if (/already registered|already been registered/i.test(raw)) return "هذا البريد مسجّل بالفعل";
  if (/password should be at least/i.test(raw)) return "كلمة المرور قصيرة جدًا";
  if (/email not confirmed/i.test(raw)) return "يجب تأكيد البريد الإلكتروني أولًا";
  if (/rate limit|too many/i.test(raw)) return "محاولات كثيرة، حاول لاحقًا";
  return raw || fallback;
}

async function authCall(
  path: string,
  init: { method?: string; body?: unknown; token?: string } = {},
): Promise<CloudResult<any>> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      method: init.method ?? "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) return fail(friendly(json, "تعذّر تنفيذ الطلب"), res.status);
    return ok(json);
  } catch {
    return fail("تعذر الاتصال بالخادم");
  }
}

async function freshSession(): Promise<CloudSession | null> {
  const s = readSession();
  if (!s) return null;
  if (s.expires_at - 60 > Date.now() / 1000) return s;
  const r = await authCall("token?grant_type=refresh_token", {
    body: { refresh_token: s.refresh_token },
  });
  if (!r.ok) {
    // Refresh token rejected: the session is really over. A network error keeps it.
    if (r.status && r.status >= 400 && r.status < 500) writeSession(null);
    return null;
  }
  const next = toSession(r.data);
  writeSession(next);
  return next;
}

async function rest(
  path: string,
  init: RequestInit & { anonymous?: boolean } = {},
): Promise<CloudResult<any>> {
  try {
    let bearer = SUPABASE_ANON_KEY;
    if (!init.anonymous) {
      const s = await freshSession();
      if (!s) return fail("غير مسجّل الدخول", 401);
      bearer = s.access_token;
    }
    const { anonymous: _anonymous, headers, ...fetchInit } = init;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...fetchInit,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${bearer}`,
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
    });
    if (!res.ok) return fail(`Request failed (${res.status})`, res.status);
    const text = await res.text();
    return ok(text ? JSON.parse(text) : null);
  } catch {
    return fail("تعذر الاتصال بالخادم");
  }
}

// ---------- accounts ----------
async function afterSignIn(session: CloudSession) {
  writeSession(session);
  // Create the profile row on first login; do nothing if it already exists.
  await rest("sao_profiles?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({
      user_id: session.user.id,
      display_name: session.user.name.slice(0, 40).padEnd(2, "_"),
      email: session.user.email,
    }),
  });
  await rest(`sao_profiles?user_id=eq.${session.user.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ last_seen: new Date().toISOString() }),
  });
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<CloudResult<CloudUser | null>> {
  const r = await authCall("signup", {
    body: { email: email.trim(), password, data: { display_name: displayName.trim() } },
  });
  if (!r.ok) return r;
  if (!r.data.access_token) {
    // E-mail confirmation is switched on in the project: no session yet.
    return ok(null);
  }
  const session = toSession(r.data);
  await afterSignIn(session);
  return ok(session.user);
}

export async function signIn(
  email: string,
  password: string,
): Promise<CloudResult<CloudUser>> {
  const r = await authCall("token?grant_type=password", {
    body: { email: email.trim(), password },
  });
  if (!r.ok) return r;
  const session = toSession(r.data);
  await afterSignIn(session);
  return ok(session.user);
}

export async function signOut(): Promise<void> {
  const s = readSession();
  writeSession(null);
  try {
    localStorage.removeItem("user-profile");
    localStorage.removeItem("auth-token");
  } catch {
    /* ignore */
  }
  if (s) await authCall("logout", { token: s.access_token }).catch(() => undefined);
}

export async function recoverPassword(
  email: string,
  redirectTo: string,
): Promise<CloudResult> {
  const r = await authCall(`recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    body: { email: email.trim() },
  });
  return r.ok ? ok(undefined) : r;
}

/** Reads "#access_token=…&type=recovery" from the link in the reset e-mail. */
export function parseRecoveryHash(hash: string): string | null {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  return p.get("type") === "recovery" ? p.get("access_token") : null;
}

export async function updatePassword(
  accessToken: string,
  newPassword: string,
): Promise<CloudResult> {
  const r = await authCall("user", {
    method: "PUT",
    token: accessToken,
    body: { password: newPassword },
  });
  return r.ok ? ok(undefined) : r;
}

// ---------- admin ----------
let adminCache: { userId: string; value: boolean } | null = null;

/** True only if the database lists this user in sao_admins (RLS shows a user their own row only). */
export async function isAdmin(): Promise<boolean> {
  const user = getSessionUser();
  if (!user) return false;
  if (adminCache?.userId === user.id) return adminCache.value;
  const r = await rest(`sao_admins?select=user_id&user_id=eq.${user.id}`);
  const value = r.ok && Array.isArray(r.data) && r.data.length > 0;
  if (r.ok) adminCache = { userId: user.id, value };
  return value;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  lastSeen: string;
  status: "active" | "banned";
  worksOpened: number;
}

export async function adminListUsers(): Promise<CloudResult<AdminUserRow[]>> {
  const [profiles, progress] = await Promise.all([
    rest("sao_profiles?select=user_id,display_name,email,status,created_at,last_seen&order=created_at.desc&limit=1000"),
    rest("sao_progress?select=user_id,data&limit=1000"),
  ]);
  if (!profiles.ok) return profiles;
  const opened = new Map<string, number>();
  if (progress.ok && Array.isArray(progress.data)) {
    for (const row of progress.data) {
      opened.set(row.user_id, Object.keys(row.data?.works ?? {}).length);
    }
  }
  return ok(
    (profiles.data as any[]).map((p) => ({
      id: p.user_id,
      name: p.display_name,
      email: p.email ?? "",
      joinedAt: p.created_at,
      lastSeen: p.last_seen,
      status: p.status === "banned" ? "banned" : "active",
      worksOpened: opened.get(p.user_id) ?? 0,
    })),
  );
}

export async function adminSetUserStatus(
  userId: string,
  status: "active" | "banned",
): Promise<CloudResult> {
  const r = await rest("rpc/sao_set_user_status", {
    method: "POST",
    body: JSON.stringify({ p_user: userId, p_status: status }),
  });
  return r.ok ? ok(undefined) : r;
}

export async function adminWorkViews(): Promise<CloudResult<Record<string, number>>> {
  const r = await rest("sao_work_views?select=work_id,views&limit=2000");
  if (!r.ok) return r;
  const out: Record<string, number> = {};
  for (const row of r.data as any[]) out[row.work_id] = Number(row.views);
  return ok(out);
}

// ---------- work visibility (admin-controlled) ----------
/** Public read: only non-published works have a row ("published" is the default). */
export async function fetchWorkStatuses(): Promise<CloudResult<Record<string, WorkStatus>>> {
  const r = await rest("sao_work_status?select=work_id,status&limit=2000", {
    anonymous: true,
  });
  if (!r.ok) return r;
  const out: Record<string, WorkStatus> = {};
  for (const row of r.data as any[]) {
    if (row.status === "draft" || row.status === "hidden") out[row.work_id] = row.status;
  }
  return ok(out);
}

export async function adminSetWorkStatus(
  workId: string,
  status: WorkStatus,
): Promise<CloudResult> {
  const r = await rest("rpc/sao_set_work_status", {
    method: "POST",
    body: JSON.stringify({ p_work_id: workId, p_status: status }),
  });
  return r.ok ? ok(undefined) : r;
}

// ---------- reviews ----------
export interface Review {
  id: string;
  userId: string;
  author: string;
  stars: number;
  comment: string;
  createdAt: string;
}

const toReview = (r: any): Review => ({
  id: r.id,
  userId: r.user_id,
  author: r.author,
  stars: Number(r.stars),
  comment: r.comment ?? "",
  createdAt: r.created_at,
});

/** Public read, newest first (the latest 200 per work). */
export async function fetchReviews(workId: string): Promise<CloudResult<Review[]>> {
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(workId)) return fail("معرّف العمل غير صالح");
  const r = await rest(
    `sao_reviews?select=id,user_id,author,stars,comment,created_at&work_id=eq.${workId}&order=created_at.desc&limit=200`,
    { anonymous: true },
  );
  return r.ok ? ok((r.data as any[]).map(toReview)) : r;
}

export function summarizeReviews(reviews: Review[]): { count: number; average: number } {
  if (reviews.length === 0) return { count: 0, average: 0 };
  const sum = reviews.reduce((n, r) => n + r.stars, 0);
  return { count: reviews.length, average: Math.round((sum / reviews.length) * 10) / 10 };
}

/** Creates the reader's review, or updates it if they already wrote one. */
export async function submitReview(
  workId: string,
  stars: number,
  comment: string,
): Promise<CloudResult> {
  const user = getSessionUser();
  if (!user) return fail("سجّل الدخول أولاً", 401);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return fail("اختر تقييماً من 1 إلى 5");
  const text = comment.trim().slice(0, 1000);
  const payload = { stars, comment: text === "" ? null : text };

  const updated = await rest(
    `sao_reviews?work_id=eq.${workId}&user_id=eq.${user.id}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload),
    },
  );
  if (!updated.ok) return updated;
  if (Array.isArray(updated.data) && updated.data.length > 0) return ok(undefined);

  const created = await rest("sao_reviews", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ work_id: workId, user_id: user.id, ...payload }),
  });
  return created.ok ? ok(undefined) : created;
}

/** Allowed for the review's author and for admins (enforced by the database). */
export async function deleteReview(reviewId: string): Promise<CloudResult> {
  if (!/^[0-9a-f-]{36}$/i.test(reviewId)) return fail("معرّف غير صالح");
  const r = await rest(`sao_reviews?id=eq.${reviewId}`, { method: "DELETE" });
  return r.ok ? ok(undefined) : r;
}

// ---------- reading history (local first, synced when logged in) ----------
export interface ReadingProgress {
  works: Record<string, { lastOpened: string; opens: number }>;
  updatedAt: string;
}

export function readLocalProgress(): ReadingProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "null");
    if (parsed && typeof parsed === "object" && parsed.works) return parsed;
  } catch {
    /* fall through */
  }
  return { works: {}, updatedAt: new Date(0).toISOString() };
}

let pushTimer: ReturnType<typeof setTimeout> | undefined;

export function noteWorkOpened(workId: string): void {
  const progress = readLocalProgress();
  const prev = progress.works[workId];
  const now = new Date().toISOString();
  progress.works[workId] = { lastOpened: now, opens: (prev?.opens ?? 0) + 1 };
  progress.updatedAt = now;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    /* ignore */
  }
  if (!cloudEnabled || !getSessionUser()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void pushProgress(), 2500);
}

async function pushProgress(): Promise<void> {
  const user = getSessionUser();
  if (!user) return;
  const progress = readLocalProgress();
  await rest("sao_progress?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      user_id: user.id,
      data: { works: progress.works },
      updated_at: progress.updatedAt,
    }),
  });
}

/** Newer copy wins: pulls the online history if it is newer, otherwise pushes this device's. */
export async function syncProgress(): Promise<"pulled" | "pushed" | "none" | "error"> {
  if (!cloudEnabled || !getSessionUser()) return "none";
  const r = await rest("sao_progress?select=data,updated_at&limit=1");
  if (!r.ok) return "error";
  const remote = (r.data as any[])[0];
  const local = readLocalProgress();
  if (remote && Date.parse(remote.updated_at) > Date.parse(local.updatedAt)) {
    try {
      localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ works: remote.data?.works ?? {}, updatedAt: remote.updated_at }),
      );
    } catch {
      /* ignore */
    }
    return "pulled";
  }
  if (Object.keys(local.works).length > 0) {
    await pushProgress();
    return "pushed";
  }
  return "none";
}

// ---------- anonymous view counter ----------
/** Counts one view per work per browser session. Works without an account. */
export async function recordWorkView(workId: string): Promise<void> {
  if (!cloudEnabled || !/^[A-Za-z0-9_-]{1,100}$/.test(workId)) return;
  try {
    if (sessionStorage.getItem(VIEW_SEEN_PREFIX + workId)) return;
    sessionStorage.setItem(VIEW_SEEN_PREFIX + workId, "1");
  } catch {
    /* storage unavailable: count anyway */
  }
  await rest("rpc/sao_record_view", {
    method: "POST",
    anonymous: true,
    body: JSON.stringify({ p_work_id: workId }),
  });
}
