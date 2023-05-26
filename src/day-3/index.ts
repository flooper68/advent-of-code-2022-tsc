import fs from "node:fs";
import path from "node:path";

function scoreLetter(letter: string) {
  const code = letter.charCodeAt(0);

  if (code < 91) {
    return code - 64 + 26;
  }

  if (code < 123) {
    return code - 96;
  }

  throw new Error(`Letter ${letter} is not a letter`);
}

function main() {
  const content = fs.readFileSync(path.join(__dirname, "./input"), "utf-8");

  const firstAnswer = content
    .split(`\n`)
    .map((line) => {
      const length = line.length;

      if (length % 2 !== 0) {
        throw new Error(`Line ${line} has an odd length`);
      }

      const firstHalf = line.slice(0, length / 2).split("");
      const secondHalf = line.slice(length / 2).split("");

      const duplicateItem = firstHalf.find((item) => secondHalf.includes(item));

      if (!duplicateItem) {
        throw new Error(`Line ${line} has no duplicate item`);
      }

      return scoreLetter(duplicateItem);
    })
    .reduce((acc, curr) => acc + curr, 0);

  const secondAnswer = content
    .split(`\n`)
    .reduce<string[][]>((acc, curr) => {
      if (acc.length === 0) {
        acc.push([curr]);
        return acc;
      }

      const lastElement = acc[acc.length - 1];

      if (lastElement.length === 3) {
        acc.push([curr]);
        return acc;
      }

      lastElement.push(curr);

      return acc;
    }, [])
    .map((line) => {
      const duplicatedItem = line[0].split("").find((item) => {
        return line[1].includes(item) && line[2].includes(item);
      });

      if (!duplicatedItem) {
        throw new Error(`Line ${line} has no duplicate item`);
      }

      return scoreLetter(duplicatedItem);
    })
    .reduce((acc, curr) => acc + curr, 0);

  console.log(firstAnswer);
  console.log(secondAnswer);
}

main();
