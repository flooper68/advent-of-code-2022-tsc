import { readFileSync } from "node:fs";
import path = require("node:path");

const localPath = path.join(__dirname, "input");

enum PointType {
  Start = "Start",
  End = "End",
  Normal = "Normal",
}

interface NormalValue {
  type: PointType.Normal;
  value: number;
}

function NormalValue(value: string): NormalValue {
  return {
    type: PointType.Normal,
    value: value.charCodeAt(0),
  };
}

interface StartValue {
  type: PointType.Start;
  value: number;
}

function StartValue(): StartValue {
  return {
    type: PointType.Start,
    value: `a`.charCodeAt(0),
  };
}

interface EndValue {
  type: PointType.End;
  value: number;
}

function EndValue(): EndValue {
  return {
    type: PointType.End,
    value: `z`.charCodeAt(0),
  };
}

function isEndValue(value: PointValue): value is EndValue {
  return value.type === PointType.End;
}

function canGoToPoint(
  currentValue: PointValue,
  nextValue: PointValue
): boolean {
  return nextValue.value < currentValue.value + 2;
}

type PointValue = NormalValue | StartValue | EndValue;

interface InitialPoint {
  visited: false;
  x: number;
  y: number;
  value: PointValue;
}

function isInitialPoint(point: Point): point is InitialPoint {
  return !point.visited;
}

interface VisitedPoint {
  visited: true;
  x: number;
  y: number;
  value: PointValue;
  distance: number;
}

function isVisitedPoint(point: Point): point is VisitedPoint {
  return point.visited;
}

type Point = InitialPoint | VisitedPoint;

type World = Point[][];

function parseValue(value: string): PointValue {
  if (value === "S") {
    return StartValue();
  }

  if (value === "E") {
    return EndValue();
  }

  return NormalValue(value);
}

function parseInput(input: string): World {
  return input.split("\n").map((line, y) => {
    return line.split("").map((value, x) => {
      return {
        visited: false,
        x,
        y,
        value: parseValue(value),
      };
    });
  });
}

function getAllStartingPoints(world: World): VisitedPoint[] {
  return world
    .flat()
    .filter((point) => point.value.value === "a".charCodeAt(0))
    .map((x) => {
      return {
        ...x,
        visited: true,
        distance: 0,
      };
    });
}

function getEdges(world: World, point: Point): Point[] {
  const leftEdge = world[point.y]?.[point.x - 1];
  const rightEdge = world[point.y]?.[point.x + 1];
  const topEdge = world[point.y - 1]?.[point.x];
  const bottomEdge = world[point.y + 1]?.[point.x];

  const potentialEdges = [leftEdge, rightEdge, topEdge, bottomEdge];

  return potentialEdges.filter((edge) => {
    return edge !== undefined;
  });
}

function getAvailableEdges(world: World, point: Point): InitialPoint[] {
  return getEdges(world, point)
    .filter((edge) => {
      return canGoToPoint(point.value, edge.value);
    })
    .filter(isInitialPoint);
}

function visitEdge(currentDistance: number, edge: Point): VisitedPoint {
  return {
    ...edge,
    visited: true,
    distance: currentDistance + 1,
  };
}

function updateWorld(world: World, point: VisitedPoint) {
  world[point.y][point.x] = point;
}

function walkPointEdges(world: World, point: VisitedPoint): VisitedPoint[] {
  return getAvailableEdges(world, point).map((edge) => {
    return visitEdge(point.distance, edge);
  });
}

function processWorldForStartingPoint(world: World, point: VisitedPoint) {
  let availableEdges: VisitedPoint[] = [];
  let nextPoint: VisitedPoint | undefined = point;

  if (nextPoint == null) {
    throw new Error("No start point");
  }

  updateWorld(world, nextPoint);

  while (nextPoint != null) {
    const nextEdges = walkPointEdges(world, nextPoint);

    nextEdges.forEach((edge) => {
      updateWorld(world, edge);
    });

    availableEdges.push(...nextEdges);

    nextPoint = availableEdges.shift();
  }

  const endPoint = world
    .flatMap((x) => x.map((y) => y))
    .find((point) => {
      return isEndValue(point.value);
    });

  if (endPoint == null) {
    return null;
  }

  if (isVisitedPoint(endPoint)) {
    return endPoint.distance;
  }

  return null;
}

function copyWorld(world: World) {
  return world.map((row) => {
    return row.map((point) => {
      return { ...point };
    });
  });
}

function main() {
  const input = readFileSync(localPath, "utf-8");

  const world = parseInput(input);

  const startingPoints = getAllStartingPoints(world);

  const distances = startingPoints.map((startingPoint) => {
    return processWorldForStartingPoint(copyWorld(world), startingPoint);
  });

  const normalizedDistances = distances.filter((x) => x != null) as number[];

  const minimumValue = Math.min(...normalizedDistances);

  console.log(minimumValue);
}

main();
