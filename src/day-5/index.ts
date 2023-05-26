import fs from "node:fs";
import path from "node:path";

type CrateStacks = string[][];

interface Instruction {
  quantity: number;
  from: number;
  to: number;
}

function applyInstruction(
  instruction: Instruction,
  stacks: CrateStacks,
  keepOrder: boolean = false
) {
  const cratesToMove = [];

  for (let i = 0; i < instruction.quantity; i++) {
    const stack = stacks[instruction.from];

    if (stack == null) {
      throw new Error(`Stack ${instruction.from} does not exist`);
    }

    const crate = stacks[instruction.from].pop();

    if (crate == null) {
      throw new Error(`Stack ${instruction.from} is empty`);
    }

    cratesToMove.push(crate);
  }
  const toStack = stacks[instruction.to];

  if (toStack == null) {
    throw new Error(`Stack ${instruction.to} does not exist`);
  }

  if (keepOrder) {
    cratesToMove.reverse();
  }

  toStack.push(...cratesToMove);
}

function parseStackCrate(stackColumnInput: string) {
  const regex = /\[(.*?)\]/;

  const firstStack = stackColumnInput.slice(0, 3);

  const match = firstStack.match(regex);
  return match ? match[1] : null;
}

function parseInput(input: string) {
  const [initialStateSection, instructionsSection] = input.split(`\n\n`);

  const initialState: CrateStacks = [];

  initialStateSection.split(`\n`).forEach((line) => {
    const stackColumns = line.split("").reduce<string[]>((acc, curr) => {
      const lastString = acc[acc.length - 1];

      if (lastString == null) {
        acc.push(curr);
        return acc;
      }

      if (lastString.length === 4) {
        acc.push(curr);
      } else {
        acc[acc.length - 1] = lastString.concat(curr);
      }

      return acc;
    }, []);

    stackColumns.forEach((stackColumn, index) => {
      const crate = parseStackCrate(stackColumn.trim());

      if (initialState[index] == null) {
        initialState[index] = [];
      }

      if (crate != null) {
        initialState[index].push(crate);
      }
    });
  });

  initialState.forEach((stack) => stack.reverse());

  const instructions = instructionsSection.split(`\n`).map((line) => {
    const regex = /^move (\d+) from (\d+) to (\d+)$/;
    const matches = line.match(regex);

    if (matches != null) {
      const slicedMatches = matches.slice(1);
      const numbers = slicedMatches.map(Number);
      return {
        quantity: numbers[0],
        from: numbers[1] - 1,
        to: numbers[2] - 1,
      };
    } else {
      throw new Error(`Invalid instruction: ${line}`);
    }
  });

  return {
    initialState,
    instructions,
  };
}

function main() {
  const content = fs.readFileSync(path.join(__dirname, "./input"), "utf-8");

  const { initialState, instructions } = parseInput(content);

  for (const instruction of instructions) {
    applyInstruction(instruction, initialState, true);
  }

  const anwser = initialState.map((stack) => stack[stack.length - 1]).join("");

  console.log(anwser);
}

main();
