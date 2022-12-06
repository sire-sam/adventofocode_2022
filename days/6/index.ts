import { readRangeSync } from "https://deno.land/std@0.167.0/io/files.ts";

const dirPath = new URL(".", import.meta.url).pathname;
const open = (path: string) => Deno.open(path, { read: true });

function markerPositionOf(file: Deno.FsFile): number {
  let marker: number | null = null;
  let range;
  for (let start = 0; marker === null; start++) {
    range = readRangeSync(file, { start: start, end: start + 3 })
      .filter((b, i, a) => a.indexOf(b, i + 1) === -1);
    if (range.length === 4) {
      marker = start + 4;
    }
  }
  return marker || 0;
}

const testExpected = 11;
const testResult = markerPositionOf(await open(dirPath + "./tests.txt"));
console.assert(testResult === testExpected, testResult, `should be ${testExpected}`);

const markerPosition = markerPositionOf(await open(dirPath + "./input.txt"));
console.log("Marker position is", markerPosition);