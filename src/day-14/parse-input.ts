function parseCoordinates(coordinates: string): [number, number] {
  const [x, y] = coordinates
    .split(",")
    .map((coordinate) => parseInt(coordinate, 10));

  if (x == null) {
    throw new Error(`Invalid coordinates: ${coordinates}`);
  }

  if (y == null) {
    throw new Error(`Invalid coordinates: ${coordinates}`);
  }

  if (isNaN(x) || isNaN(y)) {
    throw new Error(`Invalid coordinates: ${coordinates}`);
  }

  return [x, y];
}

function parseLine(line: string): [number, number][] {
  return line.split(" -> ").map(parseCoordinates);
}

export function parseInput(input: string): [number, number][][] {
  return input.split("\n").map(parseLine);
}
