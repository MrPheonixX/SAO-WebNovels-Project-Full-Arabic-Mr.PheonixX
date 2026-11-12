import { describe, it, expect } from "vitest";
import { loadPdfBlobUrl } from "./pdfSource";

const pdfResponse = () => new Response(new Uint8Array([37, 80, 68, 70]), { status: 200 });

describe("loadPdfBlobUrl", () => {
  it("fetches the file directly (no server needed) and returns a blob URL", async () => {
    const seen: string[] = [];
    (globalThis as any).fetch = async (u: string) => (seen.push(u), pdfResponse());
    const url = await loadPdfBlobUrl("https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/a.pdf");
    expect(url.startsWith("blob:")).toBe(true);
    expect(seen.length).toBe(1);
  });
  it("falls back to the proxy route when the direct request fails", async () => {
    const seen: string[] = [];
    (globalThis as any).fetch = async (u: string) => {
      seen.push(u);
      if (seen.length === 1) throw new TypeError("Failed to fetch");
      return pdfResponse();
    };
    const url = await loadPdfBlobUrl("https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/a.pdf");
    expect(url.startsWith("blob:")).toBe(true);
    expect(seen[1].includes("api/proxy-pdf?url=")).toBe(true);
  });
  it("throws when every source fails", async () => {
    (globalThis as any).fetch = async () => new Response("nope", { status: 404 });
    let threw = false;
    try {
      await loadPdfBlobUrl("https://raw.githubusercontent.com/x/y/main/a.pdf");
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});
