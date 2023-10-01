export type X = number;

export type Y = number;

export type Coordinate = [X, Y];

export type RockPath = Coordinate[];

export interface Rock {
  type: "Rock";
  x: X;
  y: Y;
}

export interface Source {
  type: "Source";
  x: X;
  y: Y;
}

export interface SettledSand {
  type: "SettledSand";
  x: X;
  y: Y;
}

export interface FallingSand {
  type: "FallingSand";
  x: X;
  y: Y;
}

export interface Bottom {
  type: "Bottom";
  y: Y;
}

export type Entity = Rock | Source | SettledSand | FallingSand | Bottom;

export interface World {
  entities: Entity[];
}

function traversePath(start: Coordinate, end: Coordinate) {
  const rocks: Rock[] = [];

  if (start[0] === end[0]) {
    const vector = start[1] < end[1] ? 1 : -1;

    let nextStep = start[1];

    while (nextStep !== end[1]) {
      rocks.push({ x: start[0], y: nextStep, type: "Rock" });
      nextStep += vector;
    }

    rocks.push({ x: start[0], y: nextStep, type: "Rock" });
  } else {
    const vector = start[0] < end[0] ? 1 : -1;

    let nextStep = start[0];

    while (nextStep !== end[0]) {
      rocks.push({ x: nextStep, y: start[1], type: "Rock" });
      nextStep += vector;
    }

    rocks.push({ x: nextStep, y: start[1], type: "Rock" });
  }

  return rocks;
}

export function drawWorld(world: World) {
  const minX = Math.min(
    ...world.entities.map((e) => {
      if (e.type === "Bottom") {
        return Infinity;
      }
      return e.x;
    })
  );
  const maxX = Math.max(
    ...world.entities.map((e) => {
      if (e.type === "Bottom") {
        return -Infinity;
      }
      return e.x;
    })
  );
  const minY = Math.min(
    ...world.entities.map((e) => {
      return e.y;
    })
  );
  const maxY = Math.max(
    ...world.entities.map((e) => {
      return e.y;
    })
  );

  const drawing: string[][] = [];

  for (let y = 0; y <= maxY - minY; y++) {
    drawing[y] = [];

    for (let x = 0; x <= maxX - minX; x++) {
      drawing[y][x] = " . ";
    }
  }

  for (const entity of world.entities) {
    if (entity.type === "Rock") {
      drawing[entity.y - minY][entity.x - minX] = " X ";
    } else if (entity.type === "Source") {
      drawing[entity.y - minY][entity.x - minX] = " + ";
    } else if (entity.type === "SettledSand") {
      drawing[entity.y - minY][entity.x - minX] = " o ";
    } else if (entity.type === "FallingSand") {
      drawing[entity.y - minY][entity.x - minX] = " # ";
    } else if (entity.type === "Bottom") {
      for (let x = 0; x <= maxX - minX; x++) {
        drawing[entity.y - minY][x] = " _ ";
      }
    }
  }

  for (const row of drawing) {
    console.log(row.join(""));
  }

  console.log(`______________________________`);
}

export function createWorld(rockPaths: RockPath[], startPoint: Coordinate) {
  const world: World = {
    entities: [],
  };

  world.entities.push({ x: startPoint[0], y: startPoint[1], type: "Source" });

  for (const rockPath of rockPaths) {
    for (let i = 0; i < rockPath.length - 1; i++) {
      const start = rockPath[i];
      const end = rockPath[i + 1];

      world.entities.push(...traversePath(start, end));
    }
  }

  const maxY = Math.max(
    ...world.entities.map((e) => {
      if (e.type === "Bottom") {
        return -Infinity;
      }
      return e.y;
    })
  );

  world.entities.push({ y: maxY + 2, type: "Bottom" });

  return world;
}

function findFallingSand(world: World): FallingSand | undefined {
  return world.entities.find((e) => e.type === "FallingSand") as FallingSand;
}

function findSource(world: World): Source | undefined {
  return world.entities.find((e) => e.type === "Source") as Source;
}

function createFallingSand(x: X, y: Y): FallingSand {
  return { type: "FallingSand", x, y };
}

function isPositionBlocked(world: World, position: Coordinate) {
  return world.entities.some((e) => {
    if (e.type === "Bottom") {
      return e.y === position[1];
    } else if (["SettledSand", "Rock"].includes(e.type)) {
      return e.x === position[0] && e.y === position[1];
    }
    return false;
  });
}

export function updateWorld(world: World) {
  const fallingSand = findFallingSand(world);

  const source = findSource(world);

  if (source == null) {
    throw new Error(`No source found`);
  }

  if (fallingSand == null) {
    world.entities.push(createFallingSand(source.x, source.y));
  } else {
    const positionBelow = [fallingSand.x, fallingSand.y + 1] as Coordinate;
    const positionLeft = [fallingSand.x - 1, fallingSand.y + 1] as Coordinate;
    const positionRight = [fallingSand.x + 1, fallingSand.y + 1] as Coordinate;

    if (!isPositionBlocked(world, positionBelow)) {
      fallingSand.x = positionBelow[0];
      fallingSand.y = positionBelow[1];
    } else if (!isPositionBlocked(world, positionLeft)) {
      fallingSand.x = positionLeft[0];
      fallingSand.y = positionLeft[1];
    } else if (!isPositionBlocked(world, positionRight)) {
      fallingSand.x = positionRight[0];
      fallingSand.y = positionRight[1];
    } else {
      (fallingSand as Entity).type = "SettledSand";
    }
  }

  //   console.log(fallingSand);

  const maxY = Math.max(
    ...world.entities.filter((e) => e.type !== "FallingSand").map((e) => e.y)
  );

  if (fallingSand != null && fallingSand.y > maxY) {
    return false;
  }

  const settledSandInSource = world.entities.find(
    (e) => e.type === "SettledSand" && e.y === source.y && e.x === source.x
  );

  if (settledSandInSource != null) {
    return false;
  }

  return true;
}
