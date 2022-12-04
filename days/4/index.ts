const textDecoder = new TextDecoder("utf-8");
const dirPath = new URL(".", import.meta.url).pathname;

const context = {
  testing: false,
  testValue: {
    part1: 2,
    part2: 4,
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

function setFromRanges([rA, rB]: [string, string]): [Set<number>, Set<number>] {
  return [setFromRange(rA), setFromRange(rB)];

}

function doRangesFullyOverlap([setA, setB]: [Set<number>, Set<number>]): boolean {
  const diffA = [...setA].filter((x) => !setB.has(x));
  const diffB = [...setB].filter((x) => !setA.has(x));

  return diffA.length === 0 || diffB.length === 0;
}

function doRangesOverlap([setA, setB]: [Set<number>, Set<number>]): boolean {
  const intersectA = [...setA].filter((x) => setB.has(x));
  const intersectB = [...setB].filter((x) => setA.has(x));

  return intersectA.length !== 0 || intersectB.length !== 0;
}

context.fileContent()
  .then(
    (r) =>
      r.split(/\n/)
        .map((e) => e.split(","))
        .map(setFromRanges)
  )
  .then((r) => {
    // part 1
    // ------
    const numberOfPairFullyOverlapping = r.filter(doRangesFullyOverlap).length;
    if (context.testing) {
      console.assert(numberOfPairFullyOverlapping === context.testValue.part1, r.length, `length should be ${context.testValue.part1}`);
    }
    console.log("Part 1 answer", numberOfPairFullyOverlapping);

    // part 2
    // ------
    const numberOfPairOverlapping = r.filter(doRangesOverlap).length;
    if (context.testing) {
      console.assert(numberOfPairOverlapping === context.testValue.part2, r.length, `length should be ${context.testValue.part2}`);
    }
    console.log("Part 2 answer", numberOfPairOverlapping);
  })
;