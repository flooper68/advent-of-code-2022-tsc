import { readFileSync } from "fs";
import { parseInput } from "./parse-input";
import { createWorld, drawWorld, updateWorld } from "./domain";

function main() {
  //   const input = readFileSync("./src/day-14/test-input", "utf-8");
  const input = readFileSync("./src/day-14/real-input", "utf-8");

  const rockPaths = parseInput(input);

  const world = createWorld(rockPaths, [500, 0]);
  //   drawWorld(world);

  let shouldContinue = true;

  while (shouldContinue) {
    shouldContinue = updateWorld(world);
    // drawWorld(world);

    const unitOfSand = world.entities.filter(
      (e) => e.type === "SettledSand"
    ).length;

    console.log(unitOfSand);
  }

  const unitOfSand = world.entities.filter(
    (e) => e.type === "SettledSand"
  ).length;

  console.log(unitOfSand);
}

main();
