import { Range } from "./range";

export interface Sensor {
  x: number;
  y: number;
}

export interface Beacon {
  x: number;
  y: number;
}

export interface InputItem {
  sensor: Sensor;
  beacon: Beacon;
}

export type Input = InputItem[];

export function getRangesOnLine(y: number, input: Input) {
  return input
    .map(({ sensor, beacon }) => {
      const metric =
        Math.abs(sensor.y - beacon.y) + Math.abs(sensor.x - beacon.x);

      const distanceOnLine = metric - Math.abs(sensor.y - y);

      if (distanceOnLine < 0) {
        return null;
      }

      return Range.create(sensor.x - distanceOnLine, sensor.x + distanceOnLine);
    })
    .filter((range): range is Range => range != null)
    .sort((a, b) => a.min - b.min)
    .reduce<Range[]>((acc, range) => {
      const lastRange = acc.pop();

      if (lastRange == null) {
        return [range];
      }

      try {
        const mergedRange = Range.concat(lastRange, range);
        acc.push(mergedRange);
      } catch (e) {
        acc.push(lastRange);
        acc.push(range);
      }

      return acc;
    }, []);
}
