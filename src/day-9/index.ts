import path from "node:path";
import fs from "node:fs";

enum Motion {
  Right = "R",
  Left = "L",
  Up = "U",
  Down = "D",
}

interface MoveInput {
  type: Motion;
  distance: number;
}

function parseMoveType(input: string) {
  switch (input) {
    case "R":
      return Motion.Right;
    case "L":
      return Motion.Left;
    case "U":
      return Motion.Up;
    case "D":
      return Motion.Down;
    default:
      throw new Error(`Invalid move type: ${input}`);
  }
}

function parseMoveDistance(input: string) {
  const distance = Number(input);

  if (isNaN(distance)) {
    throw new Error(`Invalid move distance: ${input}`);
  }

  if (distance < 0) {
    throw new Error(`Invalid move distance: ${input}`);
  }

  return distance;
}

function parseInput(content: string): Motion[] {
  return content.split("\n").flatMap((line) => {
    const inputs = line.split(" ");

    const moveType = parseMoveType(inputs[0]);
    const moveDistance = parseMoveDistance(inputs[1]);

    return Array(moveDistance).fill(moveType);
  });
}

interface Knot {
  x: number;
  y: number;
}

interface WorldState {
  moves: Motion[];
  tick: number;
  finished: boolean;
  ropeKnots: Knot[];
  history: {
    tick: number;
    ropeKnots: Knot[];
  }[];
}

function getTail(ropeKnots: Knot[]) {
  const tail = ropeKnots[ropeKnots.length - 1];

  if (ropeKnots.length < 2) {
    throw new Error("No tail found, the knot is too short");
  }

  if (tail === null) {
    throw new Error("No head found");
  }

  return tail;
}

function getHead(ropeKnots: Knot[]) {
  const head = ropeKnots[0];

  if (head === null) {
    throw new Error("No head found");
  }

  return head;
}

function moveHead(state: WorldState) {
  const move = state.moves[state.tick];

  const head = getHead(state.ropeKnots);

  switch (move) {
    case Motion.Right:
      head.x += 1;
      break;
    case Motion.Left:
      head.x -= 1;
      break;
    case Motion.Up:
      head.y += 1;
      break;
    case Motion.Down:
      head.y -= 1;
      break;
  }
}

function getHorizontalDistance(knot1: Knot, knot2: Knot) {
  return Math.abs(knot1.x - knot2.x);
}

function getVerticalDistance(knot1: Knot, knot2: Knot) {
  return Math.abs(knot1.y - knot2.y);
}

function getIsHeadAndTailTouching(
  verticalDistance: number,
  horizontalDistance: number
) {
  return verticalDistance < 2 && horizontalDistance < 2;
}

function moveConnectedKnot(fixedKnot: Knot, movedKnot: Knot): void {
  const horizontalDistance = getHorizontalDistance(fixedKnot, movedKnot);
  const verticalDistance = getVerticalDistance(fixedKnot, movedKnot);

  const isHeadAndTailTouching = getIsHeadAndTailTouching(
    verticalDistance,
    horizontalDistance
  );

  if (isHeadAndTailTouching) {
    return;
  }

  if (horizontalDistance === 0) {
    if (fixedKnot.y > movedKnot.y) {
      movedKnot.y += 1;
    } else {
      movedKnot.y -= 1;
    }
    return;
  }

  if (verticalDistance === 0) {
    if (fixedKnot.x > movedKnot.x) {
      movedKnot.x += 1;
    } else {
      movedKnot.x -= 1;
    }
    return;
  }

  if (fixedKnot.x > movedKnot.x) {
    movedKnot.x += 1;
  } else {
    movedKnot.x -= 1;
  }

  if (fixedKnot.y > movedKnot.y) {
    movedKnot.y += 1;
  } else {
    movedKnot.y -= 1;
  }
}

function recordHistory(state: WorldState) {
  state.history.push({
    tick: state.tick,
    ropeKnots: state.ropeKnots.map((ropeKnot) => {
      return {
        ...ropeKnot,
      };
    }),
  });
}

function checkForEnd(state: WorldState) {
  if (state.tick === state.moves.length) {
    state.finished = true;
  }
}

function handleNextTick(state: WorldState) {
  moveHead(state);

  for (let i = 1; i < state.ropeKnots.length; i++) {
    const fixedKnot = state.ropeKnots[i - 1];
    const movedKnot = state.ropeKnots[i];

    moveConnectedKnot(fixedKnot, movedKnot);
  }

  recordHistory(state);

  state.tick++;
  checkForEnd(state);

  return state;
}

const width = 6;
const height = 6;

function drawWorld(state: WorldState, draw: boolean) {
  if (!draw) {
    return;
  }

  let world = "";

  for (let y = height; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const head = getHead(state.ropeKnots);
      const someKnot = state.ropeKnots.find(
        (knot) => knot.x === x && knot.y === y
      );

      if (x === head.x && y === head.y) {
        world += "H";
      } else if (someKnot != null) {
        world += "X";
      } else {
        world += ".";
      }
    }
    world += "\n";
  }

  console.log(world);
}

function unique(array: string[]) {
  return Array.from(new Set(array));
}

function getAllTailPositions(state: WorldState) {
  return unique(
    state.history
      .map((history) => getTail(history.ropeKnots))
      .map((position) => `${position.x},${position.y}`)
  );
}

function getRope(length: number) {
  let rope = [];

  for (let i = 0; i < length; i++) {
    rope.push({
      x: 0,
      y: 0,
    });
  }

  return rope;
}

function main() {
  const draw = false;
  const ropeLength = 10;

  const content = fs.readFileSync(path.join(__dirname, "./input"), "utf-8");

  const moves = parseInput(content);

  let worldState: WorldState = {
    moves,
    tick: 0,
    finished: false,
    ropeKnots: getRope(ropeLength),
    history: [],
  };

  drawWorld(worldState, draw);

  while (!worldState.finished) {
    worldState = handleNextTick(worldState);
    drawWorld(worldState, draw);
  }

  const allTailPositions = getAllTailPositions(worldState);

  console.log(`Answer 1: ${allTailPositions.length}`);
}

main();
