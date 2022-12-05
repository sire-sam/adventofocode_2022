
const textDecoder = new TextDecoder("utf-8");
const dirPath = new URL(".", import.meta.url).pathname;

const context = {
  testing: false,
  isPartTwo: true,
  testValue: {
    part1: "CMZ",
    part2: "MCD"
  },
  paths: {
    data: dirPath + "./input.txt",
    part1Test: dirPath + "./test.txt"
  },
  fileContent: function () {
    return Deno.readFile(this.testing ? this.paths.part1Test : this.paths.data)
      .then((res) => textDecoder.decode(res));
  }
};
const logEntry = (e) => {
  console.log(e);
  return e;
};

context.fileContent()
  .then((r) => {
    // split map and instruction
    const [craftMap, instructions] = r.split(/\n\n/);
    
    // Translate map to arrays of strings
    // ----------------------------------
    const stacks = craftMap
      .split(/\n/)
      .slice(0, -1)
      .map((mapLine) => mapLine
        .match(/(.{4})/g)
        .map((craft) => craft.match(/[A-Z]/))
      )
      .reduce((acc, line) => {
        for (let row = 0; row < line.length; row++) {
          if (line[row] !== null) {
            const nonZeroRow = row + 1;
            acc[nonZeroRow] = !acc[nonZeroRow] ? [] : acc[nonZeroRow];
            acc[nonZeroRow].unshift(line[row]);
          }
        }
        return acc;
      }, [[]]);

    // Perform instructions
    // ----------------------------------
    for (const instruction of instructions.split(/\n/)) {
      const [quant, from, to] = instruction.match(/\d+/g).map((e) => parseInt(e));
      const items = stacks[from].splice(-quant);
      if (!context.isPartTwo) {
        items.reverse();
      }
      stacks[to].push(...items);
    }

    // Get last item on each row
    // -------------------------
    const lastOfEachRow = stacks.slice(1).map((r) => r.pop()).join(""); 

    if (context.testing) {
      console.assert(lastOfEachRow === context.testValue.part1, lastOfEachRow, `should be ${context.testValue.part1}`);
    }

    // nah
    console.log(lastOfEachRow);
  });