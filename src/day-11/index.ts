import path from "node:path";
import fs from "node:fs";

type Item = number;

enum OperationType {
  Multiply = "*",
  Add = "+",
}

enum OperationValueType {
  Old = "old",
  Value = "value",
}

interface OldValue {
  type: OperationValueType.Old;
}

interface Value {
  type: OperationValueType.Value;
  value: number;
}

type OperationValue = OldValue | Value;

interface Operation {
  type: OperationType;
  firstOperand: OperationValue;
  secondOperand: OperationValue;
}

type ReceivingMonkey = number;

interface Test {
  value: number;
  onTrue: ReceivingMonkey;
  onFalse: ReceivingMonkey;
}

interface Monkey {
  name: string;
  inspectedItems: number;
  items: Item[];
  operation: Operation;
  test: Test;
}

function parseOperationType(value: string): OperationType {
  switch (value) {
    case OperationType.Add:
      return OperationType.Add;
    case OperationType.Multiply:
      return OperationType.Multiply;
    default:
      throw new Error(`Invalid operation: ${value}`);
  }
}

function parseOperationValue(value: string): OperationValue {
  switch (value) {
    case OperationValueType.Old:
      return {
        type: OperationValueType.Old,
      };
    default: {
      const parsedValue = Number(value);

      if (isNaN(parsedValue)) {
        throw new Error(`Invalid operation value: ${value}`);
      }

      return {
        type: OperationValueType.Value,
        value: parsedValue,
      };
    }
  }
}

function parseNameLine(line: string) {
  return {
    name: line,
  };
}

function parseItemsLine(line: string) {
  const items = line
    .trim()
    .replace("Starting items: ", "")
    .split(", ")
    .map((x) => {
      const int = Number(x);

      if (isNaN(int)) {
        throw new Error(`Invalid item: ${x}`);
      }

      return int;
    });

  return {
    items,
  };
}

function parseOperationLine(line: string) {
  const [firstOperand, type, secondOperand] = line
    .trim()
    .replace("Operation: new = ", "")
    .split(" ");

  const parsedOperation = parseOperationType(type);
  const parsedFirstOperand = parseOperationValue(firstOperand);
  const parsedSecondOperand = parseOperationValue(secondOperand);

  return {
    operation: {
      type: parsedOperation,
      firstOperand: parsedFirstOperand,
      secondOperand: parsedSecondOperand,
    },
  };
}

function parseTestLine(line: string) {
  const testValue = line.trim().replace("Test: divisible by ", "");

  const parsedTestValue = Number(testValue);

  if (isNaN(parsedTestValue)) {
    throw new Error(`Invalid test value: ${testValue}`);
  }

  return {
    testValue: parsedTestValue,
  };
}

function parseOnTrueLine(line: string) {
  const onTrue = line.trim().replace("If true: throw to monkey ", "");

  const parsedOnTrue = Number(onTrue);

  if (isNaN(parsedOnTrue)) {
    throw new Error(`Invalid onTrue value: ${onTrue}`);
  }

  return {
    onTrue: parsedOnTrue,
  };
}

function parseOnFalseLine(line: string) {
  const onFalse = line.trim().replace("If false: throw to monkey ", "");

  const parsedOnFalse = Number(onFalse);

  if (isNaN(parsedOnFalse)) {
    throw new Error(`Invalid onFalse value: ${onFalse}`);
  }

  return {
    onFalse: parsedOnFalse,
  };
}

interface ParsedMonkeyBlock {
  name: string;
  items: Item[];
  operation: Operation;
  testValue: number;
  onTrue: number;
  onFalse: number;
}

function parseMonkeyBlock(block: string): ParsedMonkeyBlock {
  return block
    .split("\n")
    .map((line, index) => {
      switch (index) {
        case 0:
          return parseNameLine(line);
        case 1:
          return parseItemsLine(line);
        case 2:
          return parseOperationLine(line);
        case 3:
          return parseTestLine(line);
        case 4:
          return parseOnTrueLine(line);
        case 5:
          return parseOnFalseLine(line);
        default:
          throw new Error(`Invalid monkey block line: ${line}`);
      }
    })
    .reduce<ParsedMonkeyBlock>((acc, curr) => {
      return {
        ...acc,
        ...curr,
      };
    }, {} as unknown as ParsedMonkeyBlock);
}

function parseInput(content: string): Monkey[] {
  return content.split("\n\n").map((block) => {
    const monkey = parseMonkeyBlock(block);

    return {
      name: monkey.name,
      items: monkey.items,
      inspectedItems: 0,
      operation: {
        type: monkey.operation.type,
        firstOperand: monkey.operation.firstOperand,
        secondOperand: monkey.operation.secondOperand,
      },
      test: {
        value: monkey.testValue,
        onTrue: monkey.onTrue,
        onFalse: monkey.onFalse,
      },
    };
  });
}

interface State {
  monkeys: Monkey[];
  round: number;
  history: {
    round: number;
    state: {
      name: string;
      items: Item[];
    }[];
  }[];
}

function executeMonkeysOperation(operation: Operation, oldValue: number) {
  const operandOne =
    operation.firstOperand.type === OperationValueType.Old
      ? oldValue
      : operation.firstOperand.value;
  const operandTwo =
    operation.secondOperand.type === OperationValueType.Old
      ? oldValue
      : operation.secondOperand.value;

  switch (operation.type) {
    case OperationType.Add:
      return operandOne + operandTwo;
    case OperationType.Multiply:
      return operandOne * operandTwo;
    default:
      throw new Error(`Invalid operation type: ${operation.type}`);
  }
}

function executeMonkeyRound(state: State, monkey: Monkey, factor: number) {
  while (monkey.items.length > 0) {
    const item = monkey.items.shift();
    monkey.inspectedItems++;

    if (item === undefined) {
      throw new Error(`Invalid item: ${item}`);
    }

    let worryLevel = item;
    worryLevel = executeMonkeysOperation(monkey.operation, worryLevel);

    // For 2 part
    // worryLevel = Math.floor(worryLevel / 3);

    const managableWorryLevel = worryLevel % factor;

    if (managableWorryLevel % monkey.test.value === 0) {
      const targetMonkey = state.monkeys[monkey.test.onTrue];

      if (targetMonkey == null) {
        throw new Error(`Invalid target monkey: ${monkey.test.onTrue}`);
      }

      targetMonkey.items.push(managableWorryLevel);
    } else {
      const targetMonkey = state.monkeys[monkey.test.onFalse];

      if (targetMonkey == null) {
        throw new Error(`Invalid target monkey: ${monkey.test.onTrue}`);
      }

      targetMonkey.items.push(managableWorryLevel);
    }
  }
}

function getMonkeySnapshot(monkeys: Monkey[]) {
  return monkeys.map((monkey) => {
    return {
      name: monkey.name,
      items: monkey.items.slice(),
    };
  });
}

function executeRound(state: State, factor: number) {
  state.round++;

  for (const monkey of state.monkeys) {
    executeMonkeyRound(state, monkey, factor);
  }

  state.history.push({
    round: state.round,
    state: getMonkeySnapshot(state.monkeys),
  });
}

function reportInspectedItems(state: State) {
  console.log(`After round ${
    state.round
  }, the monkeys have inspected these items:
  ${state.monkeys
    .map((monkey) => `${monkey.name}: ${monkey.inspectedItems}`)
    .join("\n  ")}
  `);
}

function getMonkeyBusiness(monkeys: Monkey[]) {
  const [highest, second] = monkeys
    .map((monkey) => {
      return monkey.inspectedItems;
    })
    .sort((a, b) => b - a);

  if (highest === undefined || second === undefined) {
    throw new Error(`Invalid highest or second: ${highest}, ${second}`);
  }

  return highest * second;
}

function main() {
  const rounds = 10000;

  const content = fs.readFileSync(path.join(__dirname, "./input"), "utf-8");

  const monkeys = parseInput(content);

  const state: State = {
    monkeys,
    round: 0,
    history: [
      {
        round: 0,
        state: getMonkeySnapshot(monkeys),
      },
    ],
  };

  const commonDenominator = monkeys.reduce((acc, curr) => {
    return curr.test.value * acc;
  }, 1);

  const reportAtRounds = [1, 20, 1000, 2000, 3000, 4000];

  for (let i = 0; i < rounds; i++) {
    executeRound(state, commonDenominator);

    if (reportAtRounds.includes(state.round)) {
      reportInspectedItems(state);
    }
  }

  reportInspectedItems(state);

  const monkeyBusiness = getMonkeyBusiness(state.monkeys);

  // console.log(`Answer 1: ${monkeyBusiness}`);
  console.log(`Answer 2: ${monkeyBusiness}`);
}

main();
