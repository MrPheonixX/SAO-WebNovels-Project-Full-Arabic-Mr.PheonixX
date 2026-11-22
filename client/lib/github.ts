// A very small GitHub client for the admin page: it reads and writes files of THIS
// repository (the catalog, the novels' PDF files, covers) so everything lives in one repo.
// The reader's personal access token stays in this browser only (localStorage) and is
// sent to api.github.com only.
const API = "https://api.github.com";
const BASE: string = (import.meta as any).env?.BASE_URL ?? "/";
const TOKEN_KEY = "sao-gh-token";
const REPO_KEY = "sao-gh-repo";

export interface RepoRef {
  owner: string;
  repo: string;
  branch: string;
}

export type GhResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

/** https://<owner>.github.io/<repo>/  ->  { owner, repo } */
export function guessRepo(hostname: string = location.hostname, base: string = BASE): RepoRef | null {
  if (!hostname.endsWith(".github.io")) return null;
  const owner = hostname.slice(0, -".github.io".length);
  const segment = base.split("/").filter(Boolean)[0];
  return { owner, repo: segment ?? hostname, branch: "main" };
}

export const getToken = (): string => {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
};
export const saveToken = (t: string) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};
export function getRepoRef(): RepoRef | null {
  try {
    const raw = JSON.parse(localStorage.getItem(REPO_KEY) ?? "null");
    if (raw?.owner && raw?.repo) return { owner: raw.owner, repo: raw.repo, branch: raw.branch || "main" };
  } catch {
    /* fall through */
  }
  return guessRepo();
}
export const saveRepoRef = (r: RepoRef) => {
  try {
    localStorage.setItem(REPO_KEY, JSON.stringify(r));
  } catch {
    /* storage unavailable */
  }
};

const MESSAGES: Record<number, string> = {
  401: "رمز GitHub غير صالح أو منتهي.",
  403: "لا توجد صلاحية. تأكد أن الرمز يملك Contents: Read and write على هذا المستودع.",
  404: "المستودع أو الملف غير موجود، أو أن الرمز لا يصل إلى هذا المستودع.",
  409: "تعارض: تم تعديل الملف من مكان آخر. أعد المحاولة.",
  413: "الملف كبير جداً.",
  422: "رفض GitHub الطلب (غالباً تعارض في إصدار الملف).",
};

async function gh<T>(token: string, path: string, init: RequestInit = {}): Promise<GhResult<T>> {
  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) return { ok: false, status: res.status, error: MESSAGES[res.status] ?? json?.message ?? `خطأ ${res.status}` };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, status: 0, error: "تعذر الاتصال بـ GitHub." };
  }
}

const repoPath = (r: RepoRef) => `/repos/${encodeURIComponent(r.owner)}/${encodeURIComponent(r.repo)}`;
export const contentsPath = (r: RepoRef, file: string) =>
  `${repoPath(r)}/contents/${file.split("/").map(encodeURIComponent).join("/")}`;

export function encodeBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
export function decodeBase64Utf8(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const testAccess = (r: RepoRef, token: string) =>
  gh<{ full_name: string; permissions?: { push?: boolean } }>(token, repoPath(r));

export interface RepoFile {
  sha: string;
  text: string;
}

/** ok(null) when the file does not exist. Large files return only their sha. */
export async function getFile(r: RepoRef, token: string, file: string): Promise<GhResult<RepoFile | null>> {
  const res = await gh<{ sha: string; content?: string; encoding?: string }>(token, `${contentsPath(r, file)}?ref=${encodeURIComponent(r.branch)}`);
  if (!res.ok) return res.status === 404 ? { ok: true, data: null } : res;
  const c = res.data;
  return { ok: true, data: { sha: c.sha, text: c.content && c.encoding === "base64" ? decodeBase64Utf8(c.content) : "" } };
}

export const putFile = (r: RepoRef, token: string, file: string, contentBase64: string, message: string, sha?: string) =>
  gh<{ commit: { sha: string } }>(token, contentsPath(r, file), {
    method: "PUT",
    body: JSON.stringify({ message, content: contentBase64, branch: r.branch, ...(sha ? { sha } : {}) }),
  });

export const deleteFile = (r: RepoRef, token: string, file: string, message: string, sha: string) =>
  gh<{ commit: { sha: string } }>(token, contentsPath(r, file), {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: r.branch }),
  });

export interface DeployRun {
  status: string;
  conclusion: string | null;
  url: string;
  createdAt: string;
}

export async function latestRun(r: RepoRef, token: string): Promise<GhResult<DeployRun | null>> {
  const res = await gh<{ workflow_runs: { status: string; conclusion: string | null; html_url: string; created_at: string }[] }>(token, `${repoPath(r)}/actions/runs?per_page=1`);
  if (!res.ok) return res;
  const run = res.data.workflow_runs[0];
  return { ok: true, data: run ? { status: run.status, conclusion: run.conclusion, url: run.html_url, createdAt: run.created_at } : null };
}

export const dispatchDeploy = (r: RepoRef, token: string, workflow = "pages.yml") =>
  gh<null>(token, `${repoPath(r)}/actions/workflows/${workflow}/dispatches`, { method: "POST", body: JSON.stringify({ ref: r.branch }) });
