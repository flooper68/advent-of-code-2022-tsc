import { Range } from "./range";
import { expect, describe, it } from "bun:test";

describe("Range", () => {
  describe("create", () => {
    it("should create a range with the given min and max values", () => {
      const range = Range.create(1, 5);
      expect(range.min).toBe(1);
      expect(range.max).toBe(5);
    });
  });

  describe("areRangesOverlapping", () => {
    it("should return true if the ranges overlap", () => {
      const range1 = Range.create(1, 5);
      const range2 = Range.create(3, 7);
      expect(Range.areRangesOverlapping(range1, range2)).toBe(true);
    });

    it("should return true if the ranges touch", () => {
      const range1 = Range.create(1, 5);
      const range2 = Range.create(5, 7);
      expect(Range.areRangesOverlapping(range1, range2)).toBe(true);
    });

    it("should return false if the ranges do not overlap", () => {
      const range1 = Range.create(1, 5);
      const range2 = Range.create(6, 7);
      expect(Range.areRangesOverlapping(range1, range2)).toBe(false);
    });
  });

  describe("concat", () => {
    it("should concatenate two overlapping ranges", () => {
      const range1 = Range.create(1, 5);
      const range2 = Range.create(3, 7);
      const result = Range.concat(range1, range2);
      expect(result.min).toBe(1);
      expect(result.max).toBe(7);
    });

    it("should concatenate two touching ranges", () => {
      const range1 = Range.create(1, 5);
      const range2 = Range.create(5, 7);
      const result = Range.concat(range1, range2);
      expect(result.min).toBe(1);
      expect(result.max).toBe(7);
    });

    it("should concatenate two ranges next to each other", () => {
      const range1 = Range.create(1, 5);
      const range2 = Range.create(6, 7);
      const result = Range.concat(range1, range2);
      expect(result.min).toBe(1);
      expect(result.max).toBe(7);
    });

    it("should throw an error if the ranges do not overlap", () => {
      const range1 = Range.create(1, 5);
      const range2 = Range.create(7, 8);

      expect(() => Range.concat(range1, range2)).toThrow();
    });
  });
});
