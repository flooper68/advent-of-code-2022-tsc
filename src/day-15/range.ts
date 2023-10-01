export interface Range {
  min: number;
  max: number;
}

export const Range = {
  create(min: number, max: number) {
    if (min > max) {
      throw new Error(`Invalid range: ${min} > ${max}`);
    }

    return {
      min,
      max,
    };
  },
  areRangesOverlapping(range1: Range, range2: Range) {
    return range1.max >= range2.min;
  },
  concat(range1: Range, range2: Range) {
    if (range1.max + 1 < range2.min) {
      throw new Error(`Ranges are not overlapping: ${range1} ${range2}`);
    }

    return {
      min: Math.min(range1.min, range2.min),
      max: Math.max(range1.max, range2.max),
    };
  },
};
