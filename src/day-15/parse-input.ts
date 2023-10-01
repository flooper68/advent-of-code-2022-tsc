export function parseInput(input: string) {
  return input.split("\n").map((line) => {
    const [sensorPart, beaconPart] = line.split(":");

    const [sensorXPart, sensorYPart] = sensorPart
      .replace(`Sensor at `, "")
      .split(",");

    const sensorX = parseInt(sensorXPart.trim().replace("x=", ""));
    const sensorY = parseInt(sensorYPart.trim().replace("y=", ""));

    if (isNaN(sensorX)) {
      throw new Error(`Invalid sensorX: ${sensorXPart}`);
    }

    if (isNaN(sensorY)) {
      throw new Error(`Invalid sensorY: ${sensorYPart}`);
    }

    const [beaconXPart, beaconYPart] = beaconPart
      .replace("closest beacon is at ", "")
      .split(",");

    const beaconX = parseInt(beaconXPart.trim().replace("x=", ""));
    const beaconY = parseInt(beaconYPart.trim().replace("y=", ""));

    if (isNaN(beaconX)) {
      throw new Error(`Invalid beaconX: ${beaconXPart}`);
    }

    if (isNaN(beaconY)) {
      throw new Error(`Invalid beaconY: ${beaconYPart}`);
    }

    return {
      sensor: {
        x: sensorX,
        y: sensorY,
      },
      beacon: {
        x: beaconX,
        y: beaconY,
      },
    };
  });
}
