import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  resolveKeywordLimit,
  shapeKeywordList,
} from "../src/tools/keyword-tool.js";
import type { KeywordSuggestion } from "../src/types/index.js";

const row = (
  relKeyword: string,
  monthlyPcQcCnt: KeywordSuggestion["monthlyPcQcCnt"],
  monthlyMobileQcCnt: KeywordSuggestion["monthlyMobileQcCnt"]
): KeywordSuggestion =>
  ({
    relKeyword,
    monthlyPcQcCnt,
    monthlyMobileQcCnt,
    monthlyAvePcClkCnt: 0,
    monthlyAveMobileClkCnt: 0,
    monthlyAvePcCtr: 0,
    monthlyAveMobileCtr: 0,
    plAvgDepth: 10,
    compIdx: "높음",
  }) as KeywordSuggestion;

describe("resolveKeywordLimit", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NAVER_KEYWORD_DEFAULT_LIMIT;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("defaults to 50 when neither an argument nor the env var is set", () => {
    expect(resolveKeywordLimit(undefined)).toBe(50);
  });

  it("uses NAVER_KEYWORD_DEFAULT_LIMIT when no argument is given", () => {
    process.env.NAVER_KEYWORD_DEFAULT_LIMIT = "10";
    expect(resolveKeywordLimit(undefined)).toBe(10);
  });

  it("prefers an explicit argument over the env var", () => {
    process.env.NAVER_KEYWORD_DEFAULT_LIMIT = "10";
    expect(resolveKeywordLimit(200)).toBe(200);
  });

  it("treats 0 as an explicit request for every row", () => {
    process.env.NAVER_KEYWORD_DEFAULT_LIMIT = "10";
    expect(resolveKeywordLimit(0)).toBe(0);
  });

  it("ignores an unparsable env var and falls back to 50", () => {
    process.env.NAVER_KEYWORD_DEFAULT_LIMIT = "not-a-number";
    expect(resolveKeywordLimit(undefined)).toBe(50);
  });
});

describe("shapeKeywordList", () => {
  const rows = [
    row("가", 100, 100),
    row("나", 900, 50),
    row("다", 10, 5000),
    row("라", 5, 5),
  ];

  it("sorts by combined PC and mobile volume by default", () => {
    const shaped = shapeKeywordList(rows, { limit: 0 });
    expect(shaped.keywordList.map((r) => r.relKeyword)).toEqual([
      "다",
      "나",
      "가",
      "라",
    ]);
  });

  it("sorts by PC volume when sortBy is pc", () => {
    const shaped = shapeKeywordList(rows, { limit: 0, sortBy: "pc" });
    expect(shaped.keywordList.map((r) => r.relKeyword)).toEqual([
      "나",
      "가",
      "다",
      "라",
    ]);
  });

  it("keeps the API order when sortBy is none", () => {
    const shaped = shapeKeywordList(rows, { limit: 0, sortBy: "none" });
    expect(shaped.keywordList.map((r) => r.relKeyword)).toEqual([
      "가",
      "나",
      "다",
      "라",
    ]);
  });

  it("truncates to the limit and reports both counts", () => {
    const shaped = shapeKeywordList(rows, { limit: 2 });
    expect(shaped.keywordList.map((r) => r.relKeyword)).toEqual(["다", "나"]);
    expect(shaped.totalCount).toBe(4);
    expect(shaped.returnedCount).toBe(2);
    expect(shaped.truncated).toBe(true);
  });

  it("reports truncated false when the limit covers every row", () => {
    const shaped = shapeKeywordList(rows, { limit: 100 });
    expect(shaped.returnedCount).toBe(4);
    expect(shaped.truncated).toBe(false);
  });

  it('treats the "< 10" volume Naver returns as the lowest volume', () => {
    const sparse = [row("적음", "< 10" as never, "< 10" as never), row("많음", 1, 1)];
    const shaped = shapeKeywordList(sparse, { limit: 0 });
    expect(shaped.keywordList.map((r) => r.relKeyword)).toEqual(["많음", "적음"]);
  });
});
