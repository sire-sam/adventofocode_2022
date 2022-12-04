const textDecoder = new TextDecoder("utf-8");
const dirPath = new URL(".", import.meta.url).pathname;

const isRunningTest = false;
const testInputPath = dirPath + "./test.txt";
const inputPath = dirPath + "./input.txt";
const contentOf = (filePath: string) => Deno.readFile(filePath).then((res) => textDecoder.decode(res));
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const part1TestExpected = 157;

const splitLineHalf = (l: string): [string, string] => [l.slice(0, l.length / 2), l.slice(l.length / 2, l.length)];
const charMatchInLines = ([l1, l2]: [string, string]) => l2[l2.search(new RegExp(`[${l1}]`))];
const charWeight = (char: string) => chars.indexOf(char) + 1;
const sum = (a, b) => a + b;
const logEntry = (e) => {
  console.log(e);
  return e;
};

// Part One
// --------
contentOf(isRunningTest ? testInputPath : inputPath).then(
  (res) => res
    .split(/\n/)
    .map(splitLineHalf)
    .map(charMatchInLines)
    .map(charWeight)
    .reduce(sum, 0)
).then((r) => {
    if (isRunningTest) {
      console.assert(r === part1TestExpected, r, `should be ${part1TestExpected}`);
    }
    console.log("Part 1 answer", r);
  }
);

// Part two
// --------
const testPart2Path = dirPath + "./test-part-2.txt";
const part2TestExpected = 70;

function groupByThree(acc: [string?, string?, string?][], entry: string): [string?, string?, string?][] {
  acc.length && acc[acc.length - 1].length < 3
    ? acc[acc.length - 1].push(entry)
    : acc.push([entry]);
  return acc;
};

function charMatchIn([l1, l2, l3]: [string, string, string]) {
  const l1Chars = new RegExp(`[${l1}]`, "g");
  const matchL2 = new Set(l2.match(l1Chars));
  const matchL3 = new Set(l3.match(l1Chars));
  const l2Entries = matchL2.entries();
  let entryValue;

  while ((entryValue = l2Entries.next().value[0]) !== undefined) {
    if (matchL3.has(entryValue)) {
      return entryValue;
    }
  }
}

contentOf(isRunningTest ? testPart2Path : inputPath)
  .then(
    (r) => r
      .split(/\n/)
      .reduce(groupByThree, [])
      .map(charMatchIn)
      .map(charWeight)
      .reduce(sum, 0)
  ).then((r) => {
    if (isRunningTest) {
      console.assert(r === part2TestExpected, r, `should be ${part2TestExpected}`);
    }
    console.log("Part 2 answer", r);
  }
);
