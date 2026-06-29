import { describe, it, expect } from "vitest";
import { parseTsv, reportJobId } from "../src/utils/reportJob.js";

describe("reportJob helpers", () => {
  describe("parseTsv", () => {
    it("parses tab-separated rows into cell arrays", () => {
      const tsv = "a\tb\tc\n1\t2\t3";
      expect(parseTsv(tsv)).toEqual([
        ["a", "b", "c"],
        ["1", "2", "3"],
      ]);
    });

    it("handles CRLF line endings and trailing blank lines", () => {
      const tsv = "x\t1\r\ny\t2\r\n\n";
      expect(parseTsv(tsv)).toEqual([
        ["x", "1"],
        ["y", "2"],
      ]);
    });

    it("returns an empty array for empty input", () => {
      expect(parseTsv("")).toEqual([]);
    });

    it("preserves empty cells between tabs", () => {
      expect(parseTsv("a\t\tc")).toEqual([["a", "", "c"]]);
    });
  });

  describe("reportJobId", () => {
    it("reads reportJobId for stat report jobs", () => {
      expect(reportJobId({ reportJobId: "job-1" })).toBe("job-1");
    });

    it("falls back to id for master report jobs", () => {
      expect(reportJobId({ id: "master-1" })).toBe("master-1");
    });

    it("prefers reportJobId when both are present", () => {
      expect(reportJobId({ reportJobId: "a", id: "b" })).toBe("a");
    });

    it("returns undefined when neither field is present", () => {
      expect(reportJobId({})).toBeUndefined();
    });
  });
});
