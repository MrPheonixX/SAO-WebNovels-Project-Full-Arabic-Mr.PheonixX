import { describe, it, expect } from "vitest";
import { pdfFileName, pdfSources } from "./pdfSources";
import { pdfWorks } from "../data/pdfWorks";

describe("pdfSources", () => {
  it("looks inside the site first, then the external repository", () => {
    const raw = "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Volume_01.pdf";
    expect(pdfSources(raw)).toEqual(["/books/Volume_01.pdf", raw]);
  });
  it("keeps special characters encoded the way the address has them", () => {
    const raw = "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Mother%27s%20Rosario.pdf";
    expect(pdfFileName(raw)).toBe("Mother%27s%20Rosario.pdf");
    expect(pdfSources(raw)[0]).toBe("/books/Mother%27s%20Rosario.pdf");
  });
  it("never builds a local path from something that is not a plain PDF name", () => {
    expect(pdfSources("https://x.invalid/dir/")).toEqual(["https://x.invalid/dir/"]);
    expect(pdfSources("not a url").length).toBe(1);
  });
  it("every catalog work maps to a local file name", () => {
    for (const w of pdfWorks) {
      const [local] = pdfSources(w.pdfUrlRaw);
      expect(local.startsWith("/books/")).toBe(true);
      expect(local.endsWith(".pdf")).toBe(true);
    }
  });
});
