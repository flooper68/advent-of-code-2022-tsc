import fs from "node:fs";
import path from "node:path";

interface ElfPair {
  first: Section;
  second: Section;
}

interface Section {
  start: number;
  stop: number;
}

function isFirstSectionContained(first: Section, second: Section) {
  return first.start >= second.start && first.stop <= second.stop;
}

function doSectionsOverlap(first: Section, second: Section) {
  return (
    (first.start >= second.start && first.start <= second.stop) ||
    (first.stop >= second.start && first.stop <= second.stop)
  );
}

function isSomeSectionContained(elfPair: ElfPair) {
  return (
    isFirstSectionContained(elfPair.first, elfPair.second) ||
    isFirstSectionContained(elfPair.second, elfPair.first)
  );
}

function main() {
  const content = fs.readFileSync(path.join(__dirname, "./input"), "utf-8");

  const parsedElfPairs = content.split(`\n`).map((line) => {
    const elfSections = line.split(",").map((item) => {
      const sectionDefinition = item.split("-");
      const start = parseInt(sectionDefinition[0], 10);
      const stop = parseInt(sectionDefinition[1], 10);

      return {
        start,
        stop,
      };
    });

    return {
      first: elfSections[0],
      second: elfSections[1],
    };
  });

  const firstAnswer = parsedElfPairs.reduce((acc, curr) => {
    if (isSomeSectionContained(curr)) {
      return acc + 1;
    }

    return acc;
  }, 0);

  const secondAnswer = parsedElfPairs.reduce((acc, curr) => {
    if (
      doSectionsOverlap(curr.first, curr.second) ||
      isSomeSectionContained(curr)
    ) {
      return acc + 1;
    }

    return acc;
  }, 0);

  console.log(firstAnswer);
  console.log(secondAnswer);
}

main();
