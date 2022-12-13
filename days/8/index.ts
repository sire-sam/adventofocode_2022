import { readLines } from "https://deno.land/std@0.167.0/io/buffer.ts";
import FsFile = Deno.FsFile;

const dirPath = new URL(".", import.meta.url).pathname;

type Height = number;
type Score = number;
type AreaMap = Height[][];
type ScoreMap = Score[][];
type Range = [Height?, Height?];
type Visibility = 1 | 0;
type VisibilityMap = Visibility[][];

function inputToMaps(f: FsFile): Promise<[AreaMap, VisibilityMap]> {
  return new Promise(async (resolve) => {
    const area: AreaMap = [];
    const visibility: VisibilityMap = [];
    let rowIndex = 0;
    for await(const l of readLines(f)) {
      area.push(l.split("").map(Number));
      visibility[rowIndex] = Array.from(area[area.length - 1]).fill(0) as Visibility[];
      rowIndex++;
    }
    resolve([area, visibility]);
  });
}

function visibilityForRow(row: Height[], rowVisibility: Visibility[], range: Range): Visibility[] {
  if (row.length === 0) {
    return [];
  }

  const pivot = Math.max(...row);
  const indexOfPivot = row.indexOf(pivot);
  const rowStart = row.slice(0, indexOfPivot);
  const rowEnd = row.slice(indexOfPivot + 1);
  const rowVisibilityStart = rowVisibility.slice(0, indexOfPivot);
  const rowVisibilityEnd = rowVisibility.slice(indexOfPivot + 1);
  const beforePivotVisibility = visibilityForRow(
    rowStart,
    rowVisibilityStart,
    [range[0], range[1] || pivot]
  );
  const afterPivotVisibility = visibilityForRow(
    rowEnd,
    rowVisibilityEnd,
    [range[0] || pivot, range[1]]
  );

  const pivotCoveredAtStart = range[0] !== undefined ? range[0] >= pivot : rowStart.includes(pivot);
  const pivotCoveredAtEnd = range[1] !== undefined ? range[1] >= pivot : rowEnd.includes(pivot);
  const pivotVisibility = rowVisibility[indexOfPivot] === 1 || (!pivotCoveredAtStart || !pivotCoveredAtEnd) ? 1 : 0;

  return [...beforePivotVisibility, pivotVisibility, ...afterPivotVisibility];
}

function scenicScoreForCellDirection(start: number, row: Height[], height: Height, count = 0): number {
  if (row[start] === undefined) {
    return count;
  }
  if (row[start] >= height) {
    return count + 1;
  }
  return scenicScoreForCellDirection(start + 1, row, height, count + 1);
}

Deno.open(dirPath + "./input.txt")
  .then(inputToMaps)
  .then(function doRows([areaMap, visibilityMap]): [AreaMap, VisibilityMap] {
    return [
      areaMap,
      areaMap.map<Visibility[]>((line, currentIndex) =>
        visibilityForRow(Array.from(line), visibilityMap[currentIndex], [])
      )
    ];
  })
  .then(function doColumns([areaMap, visibilitYOfRows]): [AreaMap, VisibilityMap] {
    return [
      areaMap,
      (function (): VisibilityMap {
        for (let c = 0; c < areaMap[0].length; c++) {
          const column = [];
          let columnVisibility: Visibility[] = [];
          for (let r = 0; r < areaMap.length; r++) {
            column.push(areaMap[r][c]);
            columnVisibility.push(visibilitYOfRows[r][c]);
          }
          columnVisibility = visibilityForRow(column, columnVisibility, []);
          for (let r = 0; r < areaMap.length; r++) {
            visibilitYOfRows[r][c] = columnVisibility[r];
          }
        }
        return visibilitYOfRows;
      })()
    ];
  })
  .then(([areaMap, visibilityMapResult]): AreaMap => {
    // Expected Test: 21
    console.log("part 1 result is", visibilityMapResult.flat().reduce<number>((a, b) => a + b, 0));
    return areaMap;
  })
  .then((areaMap) => {
    const scenicScoreMap: ScoreMap = [];
    for (let c = 0; c < areaMap[0].length; c++) {
      for (let r1 = 0; r1 < areaMap.length; r1++) {
        scenicScoreMap[r1] = [...areaMap[r1]].fill(-1);
        scenicScoreMap[r1][c] = -1;
      }
    }

    for (let r = 0; r < areaMap.length; r++) {
      scenicScoreMap[r] = scenicScoreMap[r]
        .map((_h, i, row) =>
          scenicScoreForCellDirection(i + 1, areaMap[r], areaMap[r][i])
          * scenicScoreForCellDirection(row.length - i, [...areaMap[r]].reverse(), areaMap[r][i])
        );
    }

    for (let c = 0; c < areaMap[0].length; c++) {
      const column: Height[] = [];
      for (let r = 0; r < areaMap.length; r++) {
        column.push(areaMap[r][c]);
      }
      for (let r = 0; r < areaMap.length; r++) {
        scenicScoreMap[r][c] =
          scenicScoreMap[r][c]
          * scenicScoreForCellDirection(r + 1, column, areaMap[r][c])
          * scenicScoreForCellDirection(column.length - r, [...column].reverse(), areaMap[r][c]);
      }
    }

    // Expect Test : 8
    console.log("part 2 result is", Math.max(...scenicScoreMap.flat()));
  });
