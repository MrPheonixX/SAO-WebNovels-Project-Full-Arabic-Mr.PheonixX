import { describe, it, expect } from "vitest";
import { isAllowedPdfUrl } from "./pdfSources";

const ok = "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/a.pdf";

describe("isAllowedPdfUrl", () => {
  it("allows the content repo", () => {
    expect(isAllowedPdfUrl(ok, "")).toBe(true);
    expect(isAllowedPdfUrl("https://github.com/MrPheonixX/My-Works-PDF-/raw/main/a.pdf", "")).toBe(true);
    expect(isAllowedPdfUrl("https://cdn.jsdelivr.net/gh/MrPheonixX/My-Works-PDF-@main/a.pdf", "")).toBe(true);
  });
  it("rejects other repos, hosts, schemes, traversal and non-pdf", () => {
    expect(isAllowedPdfUrl("https://raw.githubusercontent.com/Someone/Else/main/a.pdf", "")).toBe(false);
    expect(isAllowedPdfUrl("https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/../Else/x/a.pdf", "")).toBe(false);
    expect(isAllowedPdfUrl("https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/%2e%2e/Else/x/a.pdf", "")).toBe(false);
    expect(isAllowedPdfUrl("http://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/a.pdf", "")).toBe(false);
    expect(isAllowedPdfUrl("https://evil.com/MrPheonixX/My-Works-PDF-/main/a.pdf", "")).toBe(false);
    expect(isAllowedPdfUrl("https://user:pw@raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/a.pdf", "")).toBe(false);
    expect(isAllowedPdfUrl("https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/a.html", "")).toBe(false);
    expect(isAllowedPdfUrl("not a url", "")).toBe(false);
  });
  it("supports extra prefixes from the environment", () => {
    const extra = "raw.githubusercontent.com/Other/Repo/";
    expect(isAllowedPdfUrl("https://raw.githubusercontent.com/Other/Repo/main/a.pdf", extra)).toBe(true);
    expect(isAllowedPdfUrl("https://raw.githubusercontent.com/Other/Repo/main/a.pdf", "")).toBe(false);
  });
});
