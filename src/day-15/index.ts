import { readFileSync } from "fs";
import { getRangesOnLine } from "./domain";
import { parseInput } from "./parse-input";

const line = 2000000;
const area = 4000000;

function main() {
  const input = readFileSync("./src/day-15/real-input", "utf-8");

  const parsedInput = parseInput(input);

  const coveredOn10 = getRangesOnLine(line, parsedInput);

  const amount = coveredOn10[0].max - coveredOn10[0].min;
  console.log(`Range on line 10`, coveredOn10[0]);
  console.log(`Answer 1:`, amount);

  for (let i = 0; i <= area; i++) {
    const ranges = getRangesOnLine(i, parsedInput);

    if (ranges.length === 1) {
      continue;
    }

    if (ranges.length > 2) {
      throw new Error("Too many ranges");
    }

    const range1 = ranges[0];

    const x = range1.max + 1;
    const y = i;

    console.log(`Not covered point: ${x}, ${y}`);
    console.log(`Answer 2: ${x * 4000000 + y}`);
    break;
  }
}

main();
