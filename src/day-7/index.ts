import fs from "node:fs";
import path from "node:path";

function isCommand(line: string): boolean {
  return line?.[0] === "$";
}

enum CommandType {
  ls = "ls",
  cd = "cd",
}

interface DirectoryLsOutput {
  type: NodeType.Directory;
  name: string;
}

interface FileLsOuput {
  type: NodeType.File;
  name: string;
  size: number;
}

type LsOutput = DirectoryLsOutput | FileLsOuput;

interface LsCommand {
  type: CommandType.ls;
  output: LsOutput[];
}

interface CdCommand {
  type: CommandType.cd;
  argument: string;
}

type Command = LsCommand | CdCommand;

function parseCommandType(line: string): CommandType {
  const input = line.split(" ")[1];

  if (input == null) {
    throw new Error(`Command type not found in line: ${line}`);
  }

  switch (input) {
    case "ls":
      return CommandType.ls;
    case "cd":
      return CommandType.cd;
    default:
      throw new Error(`Unknown command type: ${input}`);
  }
}

function parseCommandArgument(line: string): string {
  const input = line.split(" ")[2];

  if (input == null) {
    throw new Error(`Command argument not found in line: ${line}`);
  }

  return input;
}

function parseLsCommand(outputLines: string[]): LsCommand {
  return {
    type: CommandType.ls as const,
    output: outputLines.map((line) => {
      const param = line.split(" ")[0];
      const name = line.split(" ")[1];

      if (param === "dir") {
        return {
          type: NodeType.Directory,
          name,
          nodes: [],
        };
      }

      return {
        type: NodeType.File,
        name,
        size: parseInt(param, 10),
      };
    }),
  };
}

function parseInput(content: string) {
  const commands: Command[] = [];
  let parsingLsOutput = false;
  let outputLines: string[] = [];

  content.split("\n").forEach((line) => {
    if (!isCommand(line)) {
      outputLines.push(line);
      return;
    }

    const commandType = parseCommandType(line);

    if (parsingLsOutput) {
      const parsedCommand = parseLsCommand(outputLines);
      commands.push(parsedCommand);

      parsingLsOutput = false;
      outputLines = [];
    }

    if (commandType === CommandType.cd) {
      const argument = parseCommandArgument(line);
      commands.push({
        type: CommandType.cd,
        argument,
      });
    } else {
      parsingLsOutput = true;
    }
  });

  if (parsingLsOutput) {
    const parsedCommand = parseLsCommand(outputLines);
    commands.push(parsedCommand);

    parsingLsOutput = false;
    outputLines = [];
  }

  return commands;
}

enum NodeType {
  Directory = "directory",
  File = "file",
}

interface Directory {
  type: NodeType.Directory;
  name: string;
}

interface File {
  type: NodeType.File;
  name: string;
  size: number;
}

type FileSystemNode = Directory | File;

interface State {
  currentPosition: string;
  nodes: Record<string, FileSystemNode>;
}

function handleCommand(command: Command, state: State) {
  switch (command.type) {
    case CommandType.ls:
      const newNodes: Record<string, FileSystemNode> = {};

      command.output.forEach((node) => {
        const path = state.currentPosition + node.name;

        if (node.type === NodeType.Directory) {
          newNodes[path] = {
            type: NodeType.Directory,
            name: node.name,
          };
        } else {
          newNodes[path] = {
            type: NodeType.File,
            name: node.name,
            size: node.size,
          };
        }
      });

      return {
        ...state,
        nodes: {
          ...state.nodes,
          ...newNodes,
        },
      };

    case CommandType.cd:
      if (command.argument === "/") {
        return {
          ...state,
          currentPosition: "/",
        };
      }

      if (command.argument === "..") {
        const newPosition = state.currentPosition
          .split("/")
          .filter((_, index, array) => index !== array.length - 2)
          .join("/");
        return {
          ...state,
          currentPosition: newPosition,
        };
      }

      return {
        ...state,
        currentPosition: state.currentPosition + command.argument + "/",
      };

    default: {
      throw new Error(`Unknown command type: ${command}`);
    }
  }
}

function getAllDirs(state: State) {
  return Object.keys(state.nodes)
    .filter((path) => state.nodes[path].type === NodeType.Directory)
    .map((path) => {
      const dir = state.nodes[path];

      return {
        path,
        name: dir.name,
      };
    });
}

function getAllChildren(state: State, path: string) {
  return Object.keys(state.nodes).filter(
    (childPath) => childPath.startsWith(path) && childPath !== path
  );
}

function getDirSize(state: State, path: string) {
  const children = getAllChildren(state, path);

  return children
    .map((childKey) => {
      const node = state.nodes[childKey];

      if (node.type === NodeType.File) {
        return node.size;
      } else {
        return 0;
      }
    })
    .reduce((acc, curr) => acc + curr, 0);
}

const totalSpace = 70000000;
const neededSpace = 30000000;

function main() {
  let state: State = {
    currentPosition: "/",
    nodes: {
      "/": {
        type: NodeType.Directory,
        name: "",
      },
    },
  };

  const content = fs.readFileSync(path.join(__dirname, "./input"), "utf-8");

  const commands = parseInput(content);

  for (const command of commands) {
    state = handleCommand(command, state);
  }

  const allDirs = getAllDirs(state);

  const dirsWithSizes = allDirs.map((dir) => {
    return {
      ...dir,
      size: getDirSize(state, dir.path),
    };
  });

  const anwserPart1 = dirsWithSizes
    .filter((dir) => dir.size < 100000)
    .reduce((acc, curr) => acc + curr.size, 0);

  console.log("Anwser to part 1: ", anwserPart1);

  const rootDir = dirsWithSizes.find((dir) => dir.path === "/");

  if (rootDir == null) {
    throw new Error("Root dir not found");
  }

  const currentUnusedSize = totalSpace - rootDir.size;
  const sizeToDelete = neededSpace - currentUnusedSize;

  const possibleDirsToDelete = dirsWithSizes.filter(
    (dir) => dir.size >= sizeToDelete
  );

  const smallestDirToDelete = possibleDirsToDelete.slice().sort((a, b) => {
    return a.size - b.size;
  })[0];

  const anwserPart2 = smallestDirToDelete.size;

  console.log("Anwser to part 2: ", anwserPart2);
}

main();
