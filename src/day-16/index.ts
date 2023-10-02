const testInput = `Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`;

const realInput = `Valve JC has flow rate=0; tunnels lead to valves XS, XK
Valve TK has flow rate=0; tunnels lead to valves AA, RA
Valve PY has flow rate=0; tunnels lead to valves UB, MW
Valve XK has flow rate=15; tunnels lead to valves CD, JC, TP, UE
Valve EI has flow rate=6; tunnels lead to valves UB, HD
Valve OV has flow rate=0; tunnels lead to valves QC, WK
Valve CX has flow rate=3; tunnels lead to valves ZN, AM, OE, YS, QE
Valve YS has flow rate=0; tunnels lead to valves QC, CX
Valve DC has flow rate=0; tunnels lead to valves UE, NM
Valve EA has flow rate=5; tunnels lead to valves QE, XO, GX
Valve VE has flow rate=0; tunnels lead to valves YH, NM
Valve RN has flow rate=0; tunnels lead to valves WK, NU
Valve VJ has flow rate=0; tunnels lead to valves QC, CS
Valve HD has flow rate=0; tunnels lead to valves JI, EI
Valve UB has flow rate=0; tunnels lead to valves EI, PY
Valve XS has flow rate=17; tunnels lead to valves JC, CE
Valve AM has flow rate=0; tunnels lead to valves NU, CX
Valve GX has flow rate=0; tunnels lead to valves EA, RA
Valve UI has flow rate=0; tunnels lead to valves NC, ZG
Valve NM has flow rate=22; tunnels lead to valves DC, VE, DX
Valve CE has flow rate=0; tunnels lead to valves XS, WD
Valve NC has flow rate=25; tunnels lead to valves UI, VQ
Valve TP has flow rate=0; tunnels lead to valves XK, RA
Valve ZN has flow rate=0; tunnels lead to valves CX, XI
Valve CS has flow rate=0; tunnels lead to valves AA, VJ
Valve MW has flow rate=23; tunnel leads to valve PY
Valve AA has flow rate=0; tunnels lead to valves TK, WC, CS, AL, MS
Valve RA has flow rate=4; tunnels lead to valves WD, TP, TK, GX, JI
Valve NU has flow rate=10; tunnels lead to valves DU, AM, RN, HS, AL
Valve QE has flow rate=0; tunnels lead to valves CX, EA
Valve AH has flow rate=0; tunnels lead to valves WK, MS
Valve YH has flow rate=20; tunnels lead to valves VE, CD
Valve SH has flow rate=0; tunnels lead to valves DU, ZG
Valve OE has flow rate=0; tunnels lead to valves WC, CX
Valve XO has flow rate=0; tunnels lead to valves EA, ZG
Valve JI has flow rate=0; tunnels lead to valves RA, HD
Valve XI has flow rate=0; tunnels lead to valves WK, ZN
Valve HS has flow rate=0; tunnels lead to valves QC, NU
Valve VQ has flow rate=0; tunnels lead to valves WK, NC
Valve UE has flow rate=0; tunnels lead to valves XK, DC
Valve YP has flow rate=19; tunnel leads to valve DX
Valve WD has flow rate=0; tunnels lead to valves CE, RA
Valve DX has flow rate=0; tunnels lead to valves NM, YP
Valve ZG has flow rate=11; tunnels lead to valves UI, SH, XO
Valve MS has flow rate=0; tunnels lead to valves AA, AH
Valve QC has flow rate=9; tunnels lead to valves HS, VJ, OV, YS
Valve DU has flow rate=0; tunnels lead to valves NU, SH
Valve WK has flow rate=12; tunnels lead to valves RN, XI, VQ, OV, AH
Valve CD has flow rate=0; tunnels lead to valves YH, XK
Valve AL has flow rate=0; tunnels lead to valves AA, NU
Valve WC has flow rate=0; tunnels lead to valves OE, AA`;

interface Node {
  name: string;
  rate: number;
  connections: string[];
}

function parseInput(input: string): Node[] {
  return input.split("\n").map((line) => {
    const parts = line.split(" ");

    const rawRate = parts[4].replace("rate=", "").replace(";", "");
    const rate = parseInt(rawRate, 10);

    const connections = parts
      .slice(9)
      .map((part) => part.replace(",", "").trim());

    return {
      name: parts[1],
      rate,
      connections,
    };
  });
}

interface NodeData {
  index: number;
  rate: number;
}

class FloydWarshall {
  private nodeToData: Record<string, NodeData>;
  private indexToNode: Record<number, string>;
  private dist: number[][];

  constructor(nodes: { name: string; rate: number; edges: string[] }[]) {
    const n = nodes.length;
    this.nodeToData = {};
    this.indexToNode = {};
    this.dist = Array.from({ length: n }, () => Array(n).fill(Infinity));

    for (let i = 0; i < n; i++) {
      const node = nodes[i];

      this.nodeToData[node.name] = { index: i, rate: node.rate };
      this.indexToNode[i] = node.name;
      this.dist[i][i] = 0;
    }

    for (const node of nodes) {
      for (const edge of node.edges) {
        const nodeIndex = this.getNodeIndex(node.name);
        const edgeIndex = this.getNodeIndex(edge);

        if (nodeIndex === -1) {
          throw new Error(
            `Invalid node name provided - ${
              node.name
            }, available nodes are ${Object.keys(this.nodeToData)}.`
          );
        }

        if (edgeIndex === -1) {
          throw new Error(
            `Invalid node name provided - ${edge}, available nodes are ${Object.keys(
              this.nodeToData
            )}.`
          );
        }

        this.dist[nodeIndex][edgeIndex] = 1;
      }
    }
  }

  private getNodeIndex(node: string): number {
    return this.nodeToData[node]?.index ?? -1;
  }

  getNodeRate(node: string): number {
    const nodeData = this.nodeToData[node];

    if (nodeData == null) {
      throw new Error(`Node ${node} not found`);
    }

    return nodeData.rate;
  }

  computeShortestPaths(): void {
    const n = this.dist.length;

    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (this.dist[i][j] > this.dist[i][k] + this.dist[k][j]) {
            this.dist[i][j] = this.dist[i][k] + this.dist[k][j];
          }
        }
      }
    }
  }

  getShortestPath(u: string, v: string): number {
    const uIndex = this.getNodeIndex(u);
    const vIndex = this.getNodeIndex(v);

    if (uIndex === -1 || vIndex === -1) {
      console.error("Invalid node names provided.");
      return Infinity;
    }

    return this.dist[uIndex][vIndex];
  }

  getDistances(): number[][] {
    return this.dist;
  }
}

function randomlyReportMemory(): void {
  if (Math.random() < 0.000001) {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(
      `The script uses approximately ${Math.round(used * 100) / 100} MB`
    );
  }
}

function getElapsedTime(path: string[], graph: FloydWarshall) {
  let currentNode = path[0];
  let time = 0;

  for (const node of path.slice(1)) {
    const distance = graph.getShortestPath(currentNode, node);
    time += distance + 1;
    currentNode = node;
  }

  return time;
}

function getAllPossiblePaths(
  path: string[],
  availableNodes: string[],
  graph: FloydWarshall
): string[][] {
  randomlyReportMemory();

  if (availableNodes.length === 0) {
    return [path];
  }

  const elapsedTime = getElapsedTime(path, graph);

  if (elapsedTime > 30) {
    return [path];
  }

  return availableNodes.flatMap((node) => {
    return getAllPossiblePaths(
      [...path, node],
      availableNodes.filter((n) => n !== node),
      graph
    );
  });
}

function computeAmount(path: string[], graph: FloydWarshall): number {
  let currentRate = 0;
  let currentNode = path[0];
  let amount = 0;
  let remainingTime = 30;

  for (const node of path.slice(1)) {
    randomlyReportMemory();
    const distance = graph.getShortestPath(currentNode, node);
    const nodeRate = graph.getNodeRate(node);

    const nextRemainingTime = remainingTime - (distance + 1);

    if (nextRemainingTime < 0) {
      amount += currentRate * remainingTime;
      return amount;
    }

    remainingTime = nextRemainingTime;
    amount += currentRate * (distance + 1);

    currentRate += nodeRate;
    currentNode = node;
  }

  amount += currentRate * remainingTime;

  return amount;
}

function withTime<T>(fn: () => T, name: string): T {
  const start = Date.now();

  const result = fn();

  const end = Date.now();

  console.log(`${name} took ${end - start}ms.`);

  return result;
}

function main() {
  console.log(`Starting...`);

  const nodes = parseInput(realInput);

  const graph = new FloydWarshall(
    nodes.map((v) => {
      return {
        name: v.name,
        rate: v.rate,
        edges: v.connections,
      };
    })
  );

  withTime(() => graph.computeShortestPaths(), "computeShortestPaths");

  const allReleasableNodes = nodes.filter((valve) => {
    return valve.rate > 0;
  });

  console.log(`There is ${allReleasableNodes.length} releasable nodes.`);

  const startingPath = ["AA"];

  const allPaths = withTime(
    () =>
      getAllPossiblePaths(
        startingPath,
        allReleasableNodes.map((v) => v.name),
        graph
      ),
    "getAllPossiblePaths"
  );

  console.log(`Computed ${allPaths.length} possible paths.`);

  const allPathsWithAmounts = withTime(
    () =>
      allPaths.map((path) => {
        const amount = computeAmount(path, graph);

        return amount;
      }),
    "computeAmounts"
  );

  const maxAmount = withTime(
    () =>
      allPathsWithAmounts.reduce((max, amount) => {
        return Math.max(max, amount);
      }, 0),
    "computeMaxAmount"
  );

  console.log(maxAmount);
}

withTime(() => main(), "main");
