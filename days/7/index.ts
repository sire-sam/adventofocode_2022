import { readLines } from "https://deno.land/std@0.167.0/io/buffer.ts";

type ObjectTree = { [fileOrDir: string]: number | ObjectTree; }
  & { __parent?: ObjectTree, __size?: { total: number } }

function isObjectTree(input: number | undefined | ObjectTree): input is ObjectTree {
  return typeof input === "object";
}

class ObjectFs {
  static root = "/";
  static moveDown = "..";

  static recursiveSize(dir: ObjectTree, size: number) {
    let parent: ObjectTree | undefined = dir;
    while (parent !== undefined) {
      if (parent && parent.__size !== undefined) {
        parent.__size.total = parent.__size.total + size;
      }
      parent = parent.__parent;
    }
  }

  private position: ObjectTree;
  private flatDirSize: { dirName: string, size: { total: number } }[] = [];
  tree: ObjectTree = { __size: { total: 0 } };

  constructor() {
    this.position = this.tree;
  }

  private cd(path: string) {
    if (path === ObjectFs.root) {
      this.position = this.tree;
    } else if (path === ObjectFs.moveDown && isObjectTree(this.position.__parent)) {
      this.position = this.position.__parent;
    } else {
      const target = this.position[path];
      if (isObjectTree(target)) {
        this.position = target;
      } else {
        console.error("ObjectFs::cd: Target Not found", { path, target, tree: this.tree });
      }
    }
  }

  private dir(dirName: string, __parent: ObjectTree) {
    const newDir: ObjectTree & { __size: { total: number } } = { __parent, __size: { total: 0 } };
    this.position[dirName] = newDir;
    this.flatDirSize.push({ dirName, size: newDir.__size });
  }

  private file(name: string, size: number) {
    const dir = this.position;
    if (isObjectTree(dir)) {
      dir[name] = size;
      ObjectFs.recursiveSize(dir, size);
    } else {
      console.error("ObjectFs:file: current position is not a dir", dir);
    }
  }

  do(instruction: string) {
    if (instruction.match(/^\$/)) {
      if (!instruction.match(/ls$/)) {
        this.cd(instruction.split("cd ")[1]);
      }
    } else {
      if (instruction.match(/^dir/)) {
        this.dir(instruction.split("dir ")[1], this.position);
      } else {
        const [fileSize, fileName] = instruction.split(" ");
        this.file(fileName, parseInt(fileSize));
      }
    }
  }

  dirsSizes(): { dirName: string, size: number }[] {
    return this.flatDirSize.map(({ dirName, size }) => ({ dirName, size: size.total }));
  }
  
  totalSize(): number {
    return this.tree.__size?.total || 0;
  }
}

const dirPath = new URL(".", import.meta.url).pathname;

async function resolvePart1(file: Deno.FsFile): Promise<number> {
  const tree = new ObjectFs();
  for await(const l of readLines(file))
    tree.do(l);


  const dirSizeFilteredAndSorted = tree.dirsSizes()
    .filter((dir) => {
      return dir.size <= 100000;
    }).reduce((acc, dir) => acc + dir.size, 0);


  return new Promise((resolve) => {
    resolve(dirSizeFilteredAndSorted);
  });
}


async function resolvePart2(file: Deno.FsFile, requiredSpace = 30000000): Promise<number> {
  const tree = new ObjectFs();
  for await(const l of readLines(file))
    tree.do(l);

  const remainingSpace = 70000000 - tree.totalSize();
  const spaceToFind = requiredSpace - remainingSpace;

  const dirSizesFilteredAndSorted: number[] = tree.dirsSizes()
    .map((e) => e.size)
    .filter((size) => size >= spaceToFind)
    .sort((a, b) => a < b ? 1 : -1);

  return new Promise((resolve) => {
    resolve(dirSizesFilteredAndSorted?.pop() || 0);
  });

}

const testExpected = 95437;
const testResult = await resolvePart1(await Deno.open(dirPath + "./test.txt"));
console.assert(testResult === testExpected, testResult, `should be ${testExpected}`);
console.log("part 1 test result - ", testResult);

const part1Result = await resolvePart1(await Deno.open(dirPath + "./input.txt"));
console.log("part 1 - result", part1Result);

const part2TextExpected = 24933642;
const pat2TestResult = await resolvePart2(await Deno.open(dirPath + "./test.txt"), 24933642);
console.assert(pat2TestResult === part2TextExpected, pat2TestResult, `should be ${part2TextExpected}`);
  console.log("part 2 test result - ", pat2TestResult);

const part2Result = await resolvePart2(await Deno.open(dirPath + "./input.txt"));
console.log("part 2 - result", part2Result);
