const dirPath = new URL(".", import.meta.url).pathname;
const textDecoder = new TextDecoder("utf-8");


// Get the fileDAta
// ----------------
// Each report is separate by two new line
// Each report contain a list of number separate by one new line.
const fileData = await Deno.readFile(dirPath + "./input.txt");

// Decode file and parse to have an array of report
// Normalize report values to integer, so we can perform math later
const reports: number[][] = textDecoder.decode(fileData)
  .split(/\n\n/)
  .map((report) =>
    report
      .split(/\n/)
      .map((entry) => parseInt(entry, 10))
  );

// Get the sum of each individual report
const reportsSum: number[] = reports
  .map((reports) =>
    reports.reduce((entry, sum) => entry + sum, 0)
  );

// Sort reports sum from highest to lowest
const reportsSumFromHighestToLowest = reportsSum.sort((a, b) => a < b ? 1 : -1);

console.log("---- Part 1 ----");
console.log("Number of calories for the elf holding the most", reportsSumFromHighestToLowest[0]);

console.log("---- Part 1 ----");
console.log("Number of calories for the 3 elves holding the most",
  reportsSumFromHighestToLowest[0] + reportsSumFromHighestToLowest[1] + reportsSumFromHighestToLowest[2]
);
