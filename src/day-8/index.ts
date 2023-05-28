import path from "node:path";
import fs from "node:fs";

type HeightGrid = number[][];

function getAllColumnsLeft(
  grid: HeightGrid,
  rowIndex: number,
  colIndex: number
): number[] {
  const columnsLeft: number[] = [];

  for (let i = 0; i < colIndex; i++) {
    columnsLeft.push(grid[rowIndex][i]);
  }

  return columnsLeft.reverse();
}

function getAllColumnsRight(
  grid: HeightGrid,
  rowIndex: number,
  colIndex: number
): number[] {
  const columnsRight: number[] = [];

  for (let i = colIndex + 1; i < grid.length; i++) {
    columnsRight.push(grid[rowIndex][i]);
  }

  return columnsRight;
}

function getAllRowsTop(
  grid: HeightGrid,
  rowIndex: number,
  colIndex: number
): number[] {
  const rowsTop: number[] = [];

  for (let i = 0; i < rowIndex; i++) {
    rowsTop.push(grid[i][colIndex]);
  }

  return rowsTop.reverse();
}

function getAllRowsBottom(
  grid: HeightGrid,
  rowIndex: number,
  colIndex: number
): number[] {
  const rowsTop: number[] = [];

  for (let i = rowIndex + 1; i < grid.length; i++) {
    rowsTop.push(grid[i][colIndex]);
  }

  return rowsTop;
}

function isTreeVisibleFromSide(height: number, heightsToTheEdge: number[]) {
  return heightsToTheEdge.every((x) => x < height);
}

function isTreeVisible(grid: HeightGrid, rowIndex: number, colIndex: number) {
  const height = grid[rowIndex][colIndex];

  const columnsToLeft = getAllColumnsLeft(grid, rowIndex, colIndex);
  const isVisibleFromLeft = isTreeVisibleFromSide(height, columnsToLeft);

  const rowsToTop = getAllRowsTop(grid, rowIndex, colIndex);
  const isVisibleFromTop = isTreeVisibleFromSide(height, rowsToTop);

  const columnsToRight = getAllColumnsRight(grid, rowIndex, colIndex);
  const isVisibleFromRight = isTreeVisibleFromSide(height, columnsToRight);

  const rowsToBottom = getAllRowsBottom(grid, rowIndex, colIndex);
  const isVisibleFromBottom = isTreeVisibleFromSide(height, rowsToBottom);

  return (
    isVisibleFromLeft ||
    isVisibleFromTop ||
    isVisibleFromRight ||
    isVisibleFromBottom
  );
}

function getTreesVisibleFromASpot(height: number, heightsToTheEdge: number[]) {
  let count = 0;

  for (let i = 0; i < heightsToTheEdge.length; i++) {
    const treeHeight = heightsToTheEdge[i];

    count += 1;

    if (treeHeight >= height) {
      return count;
    }
  }

  return count;
}

function getTreeScenicScore(
  grid: HeightGrid,
  rowIndex: number,
  colIndex: number
) {
  const height = grid[rowIndex][colIndex];

  const columnsToLeft = getAllColumnsLeft(grid, rowIndex, colIndex);
  const visibleTreesToLeft = getTreesVisibleFromASpot(height, columnsToLeft);

  const rowsToTop = getAllRowsTop(grid, rowIndex, colIndex);
  const visibleTreesToTop = getTreesVisibleFromASpot(height, rowsToTop);

  const columnsToRight = getAllColumnsRight(grid, rowIndex, colIndex);
  const visibleTreesToRight = getTreesVisibleFromASpot(height, columnsToRight);

  const rowsToBottom = getAllRowsBottom(grid, rowIndex, colIndex);
  const visibleTreesToBottom = getTreesVisibleFromASpot(height, rowsToBottom);

  return (
    visibleTreesToBottom *
    visibleTreesToLeft *
    visibleTreesToRight *
    visibleTreesToTop
  );
}

function main() {
  const content = fs.readFileSync(path.join(__dirname, "./input"), "utf-8");

  const grid: number[][] = [];

  content.split("\n").forEach((line, rowIndex) => {
    line.split("").forEach((char, colIndex) => {
      const int = parseInt(char, 10);

      if (isNaN(int)) {
        throw new Error(`Invalid input: ${char}`);
      }

      if (colIndex === 0) {
        grid[rowIndex] = [int];
      } else {
        grid[rowIndex].push(int);
      }
    });
  });

  const visibilityGrid = grid.map((row, rowIndex) => {
    return row.map((_, colIndex) => {
      return isTreeVisible(grid, rowIndex, colIndex);
    });
  });

  const scenicScoreGrid = grid.map((row, rowIndex) => {
    return row.map((_, colIndex) => {
      return getTreeScenicScore(grid, rowIndex, colIndex);
    });
  });

  const visibleCount = visibilityGrid.flat().filter(Boolean).length;
  const heighestScenicScore = scenicScoreGrid.flat().sort((a, b) => b - a)[0];

  console.log(`Anwser 1: ${visibleCount}`);
  console.log(`Anwser 8: ${heighestScenicScore}`);
}

main();
