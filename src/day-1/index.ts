import fs from "node:fs";

function main() {
  const content = fs.readFileSync("calories", "utf-8");

  const caloriesPerElf = content
    .split(`\n`)
    .join()
    .split(",,")
    .map((line) =>
      line.split(",").reduce((acc, curr) => acc + parseInt(curr), 0)
    );

  const maxCalories = Math.max(...caloriesPerElf);
  const secondMaxCalories = Math.max(
    ...caloriesPerElf.filter((x) => x !== maxCalories)
  );
  const thirdMaxCalories = Math.max(
    ...caloriesPerElf.filter(
      (x) => x !== maxCalories && x !== secondMaxCalories
    )
  );

  console.log(`First Answer is: ${maxCalories}`);

  console.log(
    `Answer is: ${maxCalories + secondMaxCalories + thirdMaxCalories}`
  );
}

main();
