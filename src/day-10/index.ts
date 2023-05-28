import path from "node:path";
import fs from "node:fs";

enum CommandType {
  Noop = "noop",
  Addx = "addx",
}

interface Noop {
  type: CommandType.Noop;
}

interface Addx {
  type: CommandType.Addx;
  value: number;
}

type Command = Noop | Addx;

function parseNoop(): Noop {
  return { type: CommandType.Noop };
}

function parseAddx(input: string): Addx {
  const value = Number(input);

  if (isNaN(value)) {
    throw new Error(`Invalid Addx value: ${input}`);
  }

  return { type: CommandType.Addx, value };
}

function parseInput(content: string): Command[] {
  return content.split("\n").map((line) => {
    const [type, value] = line.split(" ");

    switch (type) {
      case CommandType.Noop:
        return parseNoop();
      case CommandType.Addx:
        return parseAddx(value);
      default:
        throw new Error(`Invalid command type: ${type}`);
    }
  });
}

interface CpuState {
  x: number;
  cycle: number;
  executingCommand: Command | null;
  commandStartedAtCycle: number;
  stateHistory: {
    cycle: number;
    x: number;
  }[];
  executing: boolean;
}

function getInitialState(firstCommand: Command): CpuState {
  return {
    x: 1,
    cycle: 1,
    executingCommand: firstCommand,
    commandStartedAtCycle: 1,
    stateHistory: [
      {
        cycle: 1,
        x: 1,
      },
    ],
    executing: true,
  };
}

function handleCommandExecution(state: CpuState) {
  if (state.executingCommand === null) {
    throw new Error("No executing command");
  }

  switch (state.executingCommand.type) {
    case CommandType.Noop: {
      if (state.cycle - state.commandStartedAtCycle === 1) {
        state.executingCommand = null;
      }
      break;
    }
    case CommandType.Addx: {
      if (state.cycle - state.commandStartedAtCycle === 2) {
        state.x += state.executingCommand.value;
        state.executingCommand = null;
      }
      break;
    }
    default: {
      throw new Error(`Invalid command type: ${state.executingCommand}`);
    }
  }
}

function scheduleNextCommandOrEnd(
  commandsToExecute: Command[],
  state: CpuState
) {
  const nextCommand = commandsToExecute.shift();

  if (nextCommand === undefined) {
    state.executing = false;
  } else {
    state.executingCommand = nextCommand;
    state.commandStartedAtCycle = state.cycle;
  }
}

function runCpuCommands(commands: Command[]) {
  const commandsToExecute = [...commands];

  const firstCommand = commandsToExecute.shift();

  if (firstCommand === undefined) {
    throw new Error("No commands to run");
  }

  const state = getInitialState(firstCommand);

  while (state.executing) {
    state.cycle++;

    handleCommandExecution(state);

    if (state.executingCommand === null) {
      scheduleNextCommandOrEnd(commandsToExecute, state);
    }

    state.stateHistory.push({
      cycle: state.cycle,
      x: state.x,
    });
  }

  return state;
}

function getSignalStrength(cycle: number, x: number) {
  return cycle * x;
}

function drawCrt(cpuState: CpuState) {
  let crt = "";

  cpuState.stateHistory.forEach((history, index) => {
    let lineIndex = index % 40;

    if (Math.abs(lineIndex - history.x) < 2) {
      crt += "#";
    } else {
      crt += ".";
    }

    if ((index + 1) % 40 === 0) {
      crt += "\n";
    }
  });

  console.log(crt);
}

function main() {
  const content = fs.readFileSync(path.join(__dirname, "./input"), "utf-8");

  const commands = parseInput(content);

  const state = runCpuCommands(commands);

  const measuredSignalStrengths = [];

  for (const history of state.stateHistory) {
    if ((history.cycle - 20) % 40 === 0) {
      const signalStrength = getSignalStrength(history.cycle, history.x);
      measuredSignalStrengths.push(signalStrength);
    }
  }

  const sumOfSignalStrenghts = measuredSignalStrengths.reduce(
    (acc, curr) => acc + curr,
    0
  );

  console.log(`Answer 1: ${sumOfSignalStrenghts}`);

  console.log(`Answer 2:`);

  drawCrt(state);

  // The CRT is displaying the message "PLGFKAZG"
}

main();
