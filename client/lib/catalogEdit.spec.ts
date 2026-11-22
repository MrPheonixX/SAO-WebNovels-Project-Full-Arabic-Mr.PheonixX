import { describe, it, expect } from "vitest";
import { formToWork, parseCatalog, removeWork, serializeCatalog, slugify, uniqueId, upsertWork, validateWork, workToForm } from "./catalogEdit";

const base = { id: "a-1", file: "A_1.pdf", series: "S", titleEn: "A", titleAr: "أ" };

describe("catalog file", () => {
  it("round-trips and rejects junk", () => {
    const c = { version: 1, works: [base] };
    expect(parseCatalog(serializeCatalog(c))).toEqual(c);
    expect(serializeCatalog(c).endsWith("\n")).toBe(true);
    let threw = false;
    try { parseCatalog('{"x":1}'); } catch { threw = true; }
    expect(threw).toBe(true);
  });
});

describe("ids", () => {
  it("makes safe unique ids", () => {
    expect(slugify("Sword Art Online: Vol. 03!")).toBe("sword-art-online-vol-03");
    expect(slugify("سورد")).toBe("work");
    expect(uniqueId("a", ["a", "a-2"])).toBe("a-3");
    expect(uniqueId("b", ["a"])).toBe("b");
  });
});

describe("form <-> work", () => {
  it("converts text fields to a clean work and back", () => {
    const w = formToWork({ id: " x ", titleAr: " عنوان ", titleEn: "T", series: "S", volumeNumber: "3", arc: "", description: "", publishYear: "2014", rating: "9.5", tags: "أكشن، فانتازيا, رومانسي", file: "X.pdf" });
    expect(w).toEqual({ id: "x", file: "X.pdf", series: "S", titleEn: "T", titleAr: "عنوان", volumeNumber: 3, publishYear: 2014, rating: 9.5, tags: ["أكشن", "فانتازيا", "رومانسي"] });
    expect(formToWork(workToForm(w))).toEqual(w);
  });
});

describe("validation", () => {
  it("accepts a good work", () => expect(validateWork(base, [])).toEqual([]));
  it("reports every problem in Arabic", () => {
    const errs = validateWork({ ...base, id: "bad id", titleAr: "", series: "", volumeNumber: 0, rating: 11, file: "../x.exe" }, []);
    expect(errs.length).toBe(6);
  });
  it("rejects duplicate ids and files but allows keeping your own", () => {
    const all = [base, { ...base, id: "b", file: "B.pdf" }];
    expect(validateWork({ ...base, id: "b", file: "C.pdf" }, all).length).toBe(1);
    expect(validateWork({ ...base, id: "c", file: "b.PDF" }, all).length).toBe(1);
    expect(validateWork(base, all, "a-1")).toEqual([]);
  });
});

describe("editing", () => {
  it("adds, replaces (even when the id changes) and removes", () => {
    let c = { version: 1, works: [base] };
    c = upsertWork(c, { ...base, id: "b", file: "B.pdf" });
    expect(c.works.length).toBe(2);
    c = upsertWork(c, { ...base, titleEn: "Changed" });
    expect(c.works[0].titleEn).toBe("Changed");
    c = upsertWork(c, { ...base, id: "a-renamed" }, "a-1");
    expect(c.works.map((w) => w.id)).toEqual(["a-renamed", "b"]);
    expect(removeWork(c, "b").works.length).toBe(1);
  });
});
