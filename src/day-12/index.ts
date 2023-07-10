import path from "node:path";
import fs from "node:fs";

enum PointType {
  Start = "S",
  End = "E",
  Value = "V",
}

interface Added {
a: string }

interface Start {
  type: PointType.Start;
  char: string;
  position: Position;
  value: number;
}

interface End {
  type: PointType.End;
  char: string;
  position: Position;
  value: number;
}

interface Value {
  type: PointType.Value;
  char: string;
  value: number;
  position: Position;
}

type Point = Start | End | Value;

interface HeightMap {
  rows: Point[][];
}

interface Position {
  x: number;
  y: number;
}

interface Path {
  visitedPoints: Point[];
}

interface PathFindingState {
  activePath: Path | null;
  possiblePaths: Path[];
  finishedPaths: Path[];
}

function parseInput(content: string): HeightMap {
  const rows = content.split("\n").map((row, x) =>
    row.split("").map((char, y): Point => {
      const type = char;

      switch (type) {
        case PointType.Start: {
          return {
            type: PointType.Start,
            char,
            position: {
              x,
              y,
            },
            value: "a".charCodeAt(0) - 1,
          } as const;
        }
        case PointType.End: {
          return {
            type: PointType.End,
            char,
            position: {
              x,
              y,
            },
            value: "z".charCodeAt(0) + 1,
          } as const;
        }
        default: {
          return {
            type: PointType.Value,
            value: char.charCodeAt(0),
            char,
            position: {
              x,
              y,
            },
          } as const;
        }
      }
    })
  );

  return { rows };
}

const getStartPoint = (heightMap: HeightMap): Point => {
  for (let i = 0; i < heightMap.rows.length; i++) {
    for (let j = 0; j < heightMap.rows[i].length; j++) {
      if (heightMap.rows[i][j].type === PointType.Start) {
        return heightMap.rows[i][j];
      }
    }
  }

  throw new Error("No start position found");
};

const getEndPoint = (heightMap: HeightMap): Point => {
  for (let i = 0; i < heightMap.rows.length; i++) {
    for (let j = 0; j < heightMap.rows[i].length; j++) {
      if (heightMap.rows[i][j].type === PointType.End) {
        return heightMap.rows[i][j];
      }
    }
  }

  throw new Error("No start position found");
};

const getSurroundingPoints = (heightMap: HeightMap, position: Position) => {
  const topPoint = heightMap.rows[position.x - 1]?.[position.y];
  const bottomPoint = heightMap.rows[position.x + 1]?.[position.y];
  const leftPoint = heightMap.rows[position.x]?.[position.y - 1];
  const rightPoint = heightMap.rows[position.x]?.[position.y + 1];

  return [topPoint, bottomPoint, leftPoint, rightPoint].filter(Boolean);
};

function isEqualPosition(a: Position, b: Position) {
  return a.x === b.x && a.y === b.y;
}

function handleNextMove(state: PathFindingState, map: HeightMap) {
  const activePath = state.activePath;

  if (activePath == null) {
    throw new Error("No active path to follow");
  }

  const latestPoint =
    activePath.visitedPoints[activePath.visitedPoints.length - 1];

  if (latestPoint.type === PointType.Start) {
    state.finishedPaths.push(activePath);

    const nextPath = state.possiblePaths.shift();
    state.activePath = nextPath ?? null;
    return;
  }

  const surroundingPoints = getSurroundingPoints(
    map,
    latestPoint.position
  ).filter(
    (x) =>
      activePath.visitedPoints.every(
        (y) => !isEqualPosition(x.position, y.position)
      ) &&
      (x.value === latestPoint.value - 1 || x.value === latestPoint.value)
  );

  const nextPoint = surroundingPoints.shift();

  if (nextPoint == null) {
    const nextPath = state.possiblePaths.shift();
    state.activePath = nextPath ?? null;
  } else {
    while (surroundingPoints.length > 0) {
      const possiblePoint = surroundingPoints.shift();

      if (possiblePoint == null) {
        break;
      }

      state.possiblePaths.push({
        visitedPoints: [...activePath.visitedPoints, possiblePoint],
      });
    }

    activePath.visitedPoints.push(nextPoint);
  }
}

function main() {
  const content = fs.readFileSync(path.join(__dirname, "./input"), "utf-8");

  const heightMap = parseInput(content);

  const endPoint = getEndPoint(heightMap);

  const state: PathFindingState = {
    activePath: {
      visitedPoints: [endPoint],
    },
    possiblePaths: [],
    finishedPaths: [],
  };

  while (state.activePath != null) {
    handleNextMove(state, heightMap);
  }

  const shortestPath =
    state.finishedPaths
      .map((x) => x.visitedPoints.length)
      .sort((a, b) => a - b)[0] - 1;

  console.log(`Anwser 1:`, shortestPath);
}

main();
