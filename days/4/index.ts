const textDecoder = new TextDecoder("utf-8");
const dirPath = new URL(".", import.meta.url).pathname;

const context = {
  testing: false,
  testValue: {
    part1: 2
  },
  paths: {
    data: dirPath + "./input.txt",
    part1Test: dirPath + "./test.txt"
  },
  fileContent: function () {
    return Deno.readFile(this.testing ? this.paths.part1Test : this.paths.data)
      .then((res) => textDecoder.decode(res));
  },
  logEntry: (e) => {
    console.log(e);
    return e;
  }
};

function setFromRange(range: string): Set<number> {
  const s = new Set();
  const [start, end] = range.split(/-/).map((e) => parseInt(e));
  let entry = start;
  while ((entry <= end)) {
    s.add(entry);
    entry++;
  }
  return s;
}

function doRangesOverlap([rangeA, rangeB]: [string, string]): boolean {
  const setA = setFromRange(rangeA);
  const setB = setFromRange(rangeB);

  const diffA = [...setA].filter((x) => !setB.has(x));
  const diffB = [...setB].filter((x) => !setA.has(x));

  return diffA.length === 0 || diffB.length === 0;
}


// Part One
// --------
context.fileContent()
  .then(
    (r) =>
      r.split(/\n/)
        .map((e) => e.split(","))
        .filter(doRangesOverlap)
  )
  .then((r) => {
    if (context.testing) {
      console.assert(r.length === context.testValue.part1, r.length, `length should be ${context.testValue.part1}`);
    }
    console.log("Part 1 answer", r.length);
  });