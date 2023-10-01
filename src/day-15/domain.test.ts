import { expect, describe, it } from "bun:test";
import { getRangesOnLine } from "./domain";

describe("Range", () => {
  it("should create a range with maximum distance if center is on the same line", () => {
    const ranges = getRangesOnLine(1, [
      {
        sensor: {
          x: 1,
          y: 1,
        },
        beacon: {
          x: 3,
          y: 1,
        },
      },
    ]);

    expect(ranges[0].min).toBe(-1);
    expect(ranges[0].max).toBe(3);
  });

  it("should create a range with smaller distance if center is on a one line up", () => {
    const ranges = getRangesOnLine(2, [
      {
        sensor: {
          x: 1,
          y: 1,
        },
        beacon: {
          x: 3,
          y: 1,
        },
      },
    ]);

    expect(ranges[0].min).toBe(0);
    expect(ranges[0].max).toBe(2);
  });

  it("should create a range with smaller distance if center is two lines up", () => {
    const ranges = getRangesOnLine(3, [
      {
        sensor: {
          x: 1,
          y: 1,
        },
        beacon: {
          x: 3,
          y: 1,
        },
      },
    ]);

    expect(ranges[0].min).toBe(1);
    expect(ranges[0].max).toBe(1);
  });

  it("should not create any range if there is no area covered", () => {
    const ranges = getRangesOnLine(4, [
      {
        sensor: {
          x: 1,
          y: 1,
        },
        beacon: {
          x: 3,
          y: 1,
        },
      },
    ]);

    expect(ranges.length).toBe(0);
  });

  it("should concat ranges for overlapping sensors", () => {
    const ranges = getRangesOnLine(1, [
      {
        sensor: {
          x: 1,
          y: 1,
        },
        beacon: {
          x: 3,
          y: 1,
        },
      },

      {
        sensor: {
          x: 2,
          y: 1,
        },
        beacon: {
          x: 5,
          y: 1,
        },
      },
    ]);

    expect(ranges.length).toBe(1);
    expect(ranges[0].min).toBe(-1);
    expect(ranges[0].max).toBe(5);
  });

  it("should concat ranges for overlapping sensors - case 2", () => {
    const ranges = getRangesOnLine(1, [
      {
        sensor: {
          x: 1,
          y: 1,
        },
        beacon: {
          x: 3,
          y: 1,
        },
      },
      {
        sensor: {
          x: 2,
          y: 1,
        },
        beacon: {
          x: 5,
          y: 1,
        },
      },
      {
        sensor: {
          x: 2,
          y: 1,
        },
        beacon: {
          x: 10,
          y: 1,
        },
      },
    ]);

    expect(ranges.length).toBe(1);
    expect(ranges[0].min).toBe(-6);
    expect(ranges[0].max).toBe(10);
  });

  it("should keep ranges separate if they are not overlapping", () => {
    const ranges = getRangesOnLine(1, [
      {
        sensor: {
          x: 1,
          y: 1,
        },
        beacon: {
          x: 2,
          y: 1,
        },
      },

      {
        sensor: {
          x: 10,
          y: 1,
        },
        beacon: {
          x: 11,
          y: 1,
        },
      },
    ]);

    expect(ranges.length).toBe(2);
    expect(ranges[0].min).toBe(0);
    expect(ranges[0].max).toBe(2);
    expect(ranges[1].min).toBe(9);
    expect(ranges[1].max).toBe(11);
  });
});
