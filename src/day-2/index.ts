import fs from "node:fs";
import path from "node:path";

enum Moves {
  Rock = "Rock",
  Paper = "Paper",
  Scissors = "Scissors",
}

const OponentCodes = {
  A: Moves.Rock,
  B: Moves.Paper,
  C: Moves.Scissors,
};

const MyCodes = {
  X: Moves.Rock,
  Y: Moves.Paper,
  Z: Moves.Scissors,
};

const MoveScores = {
  [Moves.Rock]: 1,
  [Moves.Paper]: 2,
  [Moves.Scissors]: 3,
};

enum GameResults {
  Win = "Win",
  Lose = "Lose",
  Draw = "Draw",
}

const GameResultsScores = {
  [GameResults.Win]: 6,
  [GameResults.Draw]: 3,
  [GameResults.Lose]: 0,
};

const WantedResult = {
  X: GameResults.Lose,
  Y: GameResults.Draw,
  Z: GameResults.Win,
};

function resolveWinner(oponentMove: Moves, myMove: Moves) {
  switch (oponentMove) {
    case Moves.Rock:
      switch (myMove) {
        case Moves.Rock:
          return GameResults.Draw;
        case Moves.Paper:
          return GameResults.Win;
        case Moves.Scissors:
          return GameResults.Lose;
      }
    case Moves.Paper:
      switch (myMove) {
        case Moves.Rock:
          return GameResults.Lose;
        case Moves.Paper:
          return GameResults.Draw;
        case Moves.Scissors:
          return GameResults.Win;
      }
    case Moves.Scissors:
      switch (myMove) {
        case Moves.Rock:
          return GameResults.Win;
        case Moves.Paper:
          return GameResults.Lose;
        case Moves.Scissors:
          return GameResults.Draw;
      }
  }
}

function getMove(oponentMove: Moves, result: GameResults) {
  switch (oponentMove) {
    case Moves.Rock:
      switch (result) {
        case GameResults.Draw:
          return Moves.Rock;
        case GameResults.Win:
          return Moves.Paper;
        case GameResults.Lose:
          return Moves.Scissors;
      }
    case Moves.Paper:
      switch (result) {
        case GameResults.Draw:
          return Moves.Paper;
        case GameResults.Win:
          return Moves.Scissors;
        case GameResults.Lose:
          return Moves.Rock;
      }
    case Moves.Scissors:
      switch (result) {
        case GameResults.Draw:
          return Moves.Scissors;
        case GameResults.Win:
          return Moves.Rock;
        case GameResults.Lose:
          return Moves.Paper;
      }
  }
}

function scoreGame(oponentMove: Moves, myMove: Moves) {
  const winner = resolveWinner(oponentMove, myMove);

  return GameResultsScores[winner] + MoveScores[myMove];
}

function main() {
  const content = fs.readFileSync(path.join(__dirname, "./strategy"), "utf-8");

  const firstAnswer = content
    .split(`\n`)
    .map((line) => line.split(" "))
    .reduce((acc, curr) => {
      const oponentMove = OponentCodes[curr[0]];
      const myMove = MyCodes[curr[1]];

      return acc + scoreGame(oponentMove, myMove);
    }, 0);

  const secondAnswer = content
    .split(`\n`)
    .map((line) => line.split(" "))
    .reduce((acc, curr) => {
      const oponentMove = OponentCodes[curr[0]];
      const wantedResult = WantedResult[curr[1]];

      const myMove = getMove(oponentMove, wantedResult);

      return acc + scoreGame(oponentMove, myMove);
    }, 0);

  console.log(firstAnswer);
  console.log(secondAnswer);
}

main();
