import { readRangeSync } from "https://deno.land/std@0.167.0/io/files.ts";

const dirPath = new URL(".", import.meta.url).pathname;
const open = (path: string) => Deno.open(path, { read: true });

function markerPositionOf(file: Deno.FsFile, markerLength: number): number {
  let marker: number | null = null;
  let range;
  for (let start = 0; marker === null; start++) {
    range = readRangeSync(file, { start: start, end: start + (markerLength - 1) })
      .filter((b, i, a) => a.indexOf(b, i + 1) === -1);
    if (range.length === markerLength) {
      marker = start + markerLength;
    }
  }
  return marker || 0;
}

const part1MarkerLength = 4;
const testExpected = 11;
const testResult = markerPositionOf(await open(dirPath + "./tests.txt"), part1MarkerLength);
console.assert(testResult === testExpected, testResult, `should be ${testExpected}`);

let markerPosition = markerPositionOf(await open(dirPath + "./input.txt"), part1MarkerLength);
console.log("Part 1 - Marker position is", markerPosition);

const part2MarkerLength = 14;
const test2Expected = 26;
const test2Result = markerPositionOf(await open(dirPath + "./tests-2.txt"), part2MarkerLength);
console.assert(test2Expected === test2Result, test2Result, `should be ${test2Expected}`);

markerPosition = markerPositionOf(await open(dirPath + "./input.txt"), part2MarkerLength);
console.log("Part 2 - Marker position is", markerPosition);
