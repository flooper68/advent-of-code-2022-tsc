import { readFile } from "fs/promises";

type Content = number | Content[];

type Packet = Content[];

function parseInput(input: string): [Packet, Packet][] {
  const lines = input.split("\n\n").map((linePair) => {
    const [line1, line2] = linePair.split("\n");
    return [JSON.parse(line1), JSON.parse(line2)] as [Packet, Packet];
  });

  return lines;
}

function isNumber(content: Content): content is number {
  return typeof content === "number";
}

function isArray(content: Content): content is Content[] {
  return Array.isArray(content);
}

enum ResultType {
  InOrder = "InOrder",
  NotInOrder = "NotInOrder",
  Continue = "Continue",
}

function logContent(value: Content): string {
  if (isNumber(value)) {
    return `${value}`;
  } else if (isArray(value)) {
    return `[${value.map(logContent).join(",")}]`;
  }

  return "";
}

function logNestedMessage(message: string, depth: number) {
  console.log(`${" ".repeat(depth)} - ${message}`);
}

function logCompareMessage(a: Content, b: Content, depth: number) {
  logNestedMessage(`Compare ${logContent(a)} vs ${logContent(b)}`, depth);
}

function areNumbersInOrder(a: number, b: number, depth: number): ResultType {
  logCompareMessage(a, b, depth);

  if (a < b) {
    logNestedMessage(
      `Left side is smaller, so inputs are in the right order`,
      depth + 1
    );
    return ResultType.InOrder;
  } else if (a > b) {
    logNestedMessage(
      `Right side is smaller, so inputs are not in the right order`,
      depth + 1
    );
    return ResultType.NotInOrder;
  }

  return ResultType.Continue;
}

function areArraysInOrder(a: Content[], b: Content[], depth = 0): ResultType {
  logCompareMessage(a, b, depth);

  const maxLength = Math.max(a.length, b.length);

  for (let i = 0; i < maxLength; i++) {
    const left = a[i];
    const right = b[i];

    if (left == null) {
      logNestedMessage(
        `Left side ran out of items, so inputs are in the right order`,
        depth + 1
      );
      return ResultType.InOrder;
    }

    if (right == null) {
      logNestedMessage(
        `Right side ran out of items, so inputs are not in the right order`,
        depth + 1
      );
      return ResultType.NotInOrder;
    }

    if (isNumber(left) && isNumber(right)) {
      const result = areNumbersInOrder(left, right, depth + 1);

      if (result === ResultType.NotInOrder) {
        return ResultType.NotInOrder;
      } else if (result === ResultType.InOrder) {
        return ResultType.InOrder;
      }
    } else if (isArray(left) && isArray(right)) {
      const result = areArraysInOrder(left, right, depth + 1);

      if (result === ResultType.NotInOrder) {
        return ResultType.NotInOrder;
      } else if (result === ResultType.InOrder) {
        return ResultType.InOrder;
      }
    } else if (isNumber(left) && isArray(right)) {
      logCompareMessage(left, right, depth + 1);
      logNestedMessage(
        `Mixed types; convert right to [4] and retry comparison`,
        depth + 2
      );

      const result = areArraysInOrder([left], right, depth + 2);

      if (result === ResultType.NotInOrder) {
        return ResultType.NotInOrder;
      } else if (result === ResultType.InOrder) {
        return ResultType.InOrder;
      }
    } else if (isArray(left) && isNumber(right)) {
      logCompareMessage(left, right, depth + 1);
      logNestedMessage(
        `Mixed types; convert right to [4] and retry comparison`,
        depth + 2
      );

      const result = areArraysInOrder(left, [right], depth + 2);

      if (result === ResultType.NotInOrder) {
        return ResultType.NotInOrder;
      } else if (result === ResultType.InOrder) {
        return ResultType.InOrder;
      }
    }
  }

  return ResultType.Continue;
}

function isPairInOrder(pair: [Packet, Packet]) {
  const [a, b] = pair;

  return areArraysInOrder(a, b);
}

async function main() {
  const input = await readFile("./src/day-13/real-input", "utf-8");
  // const input = await readFile("./src/day-13/test-input", "utf-8");
  const pairs = parseInput(input);

  const pairsWithInOrder = pairs.map((pair, index) => {
    console.log(`\n`);

    console.log(`Pair ${index + 1}`);
    const inOrder = isPairInOrder(pair);
    console.log(inOrder);

    return {
      first: pair[0],
      second: pair[1],
      inOrder,
      index: index + 1,
    };
  });

  const sumOfInOrder = pairsWithInOrder.reduce((acc, pair) => {
    if (pair.inOrder === ResultType.InOrder) {
      return acc + pair.index;
    }

    return acc;
  }, 0);

  console.log(`__________-`);
  console.log(sumOfInOrder);

  const sortedPackets = pairs
    .flat()
    .concat([[[2]], [[6]]])
    .slice()
    .sort((a, b) => {
      const inOrder = isPairInOrder([a, b]);

      return inOrder === ResultType.InOrder ? -1 : 1;
    });

  sortedPackets.forEach((packet) => {
    console.log(logContent(packet));
  });

  const firstPacketIndex = sortedPackets.findIndex((packet) => {
    return JSON.stringify(packet) === JSON.stringify([[2]]);
  });

  const secondPacketIndex = sortedPackets.findIndex((packet) => {
    return JSON.stringify(packet) === JSON.stringify([[6]]);
  });

  const key = (firstPacketIndex + 1) * (secondPacketIndex + 1);

  console.log(key);
}

main();
