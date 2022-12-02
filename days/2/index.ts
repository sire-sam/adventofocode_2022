const dirPath = new URL(".", import.meta.url).pathname;
const textDecoder = new TextDecoder("utf-8");

type OpponentMove = "A" | "B" | "C";
type ResultStrategy = "X" | "Y" | "Z";

/**
 * Potential result of a round
 */
enum RoundResult {
  Loose = -1,
  Draw = 0,
  Win = 1
}

/**
 * Point Per Move
 * Point per played move:
 * - Rock: 1 point
 * - Paper: 2 points
 * - Scissors: 3 points
 */
enum MoveAsPoint {
  Rock = 1,
  Paper = 2,
  Scissor = 3
}

/**
 * Get the result for a round where the first level is the contender move and secon opponent move.
 * Result is given for contender.
 *
 * Rule:
 * - Rock > Scissors
 * - Scissors > Paper
 * - Paper > Rock
 */
const resultForRound: Record<MoveAsPoint, Record<MoveAsPoint, RoundResult>> = {
  [MoveAsPoint.Rock]: {
    [MoveAsPoint.Rock]: RoundResult.Draw,
    [MoveAsPoint.Scissor]: RoundResult.Win,
    [MoveAsPoint.Paper]: RoundResult.Loose
  },
  [MoveAsPoint.Scissor]: {
    [MoveAsPoint.Rock]: RoundResult.Loose,
    [MoveAsPoint.Scissor]: RoundResult.Draw,
    [MoveAsPoint.Paper]: RoundResult.Win
  },
  [MoveAsPoint.Paper]: {
    [MoveAsPoint.Rock]: RoundResult.Win,
    [MoveAsPoint.Scissor]: RoundResult.Loose,
    [MoveAsPoint.Paper]: RoundResult.Draw
  }
};

/**
 * Give the move you should play against the opponent to match the strategy guide
 */
const moveForStrategyResult: Record<MoveAsPoint, Record<RoundResult, MoveAsPoint>> = {
  [MoveAsPoint.Rock]: {
    [RoundResult.Draw]: MoveAsPoint.Rock,
    [RoundResult.Win]: MoveAsPoint.Paper,
    [RoundResult.Loose]: MoveAsPoint.Scissor
  },
  [MoveAsPoint.Scissor]: {
    [ RoundResult.Loose]: MoveAsPoint.Paper,
    [RoundResult.Draw]: MoveAsPoint.Scissor ,
    [RoundResult.Win]: MoveAsPoint.Rock
  },
  [MoveAsPoint.Paper]: {
    [RoundResult.Win]: MoveAsPoint.Scissor,
    [RoundResult.Loose]: MoveAsPoint.Rock,
    [RoundResult.Draw]: MoveAsPoint.Paper
  }
}

/**
 * Points obtained by round result
 */
const pointForRoundResult: Record<RoundResult, number> = {
  [RoundResult.Win]: 6,
  [RoundResult.Draw]: 3,
  [RoundResult.Loose]: 0
};

const opponentMoveMap: Record<OpponentMove, MoveAsPoint> = {
  A: MoveAsPoint.Rock,
  B: MoveAsPoint.Paper,
  C: MoveAsPoint.Scissor
};

const resultStrategyMap: Record<ResultStrategy, RoundResult> = {
  X: RoundResult.Loose,
  Y: RoundResult.Draw,
  Z: RoundResult.Win
};

/*
* Get an array array of round on the form of [OpponentMove, ResultStrategy][]
*
* File structure:
* - Each round is separate by a new line
* - Each round contains 3 char: [opponent move][white space][recommended move]
*
*/
function fileToArrayOfRound(file: Uint8Array): [OpponentMove, ResultStrategy][] {
  return textDecoder.decode(file)
    .split(/\n/)
    .map((round) => round
      .split(/\s/) as [OpponentMove, ResultStrategy]
    );
}


function getScoreFor(rounds: [OpponentMove, ResultStrategy][]): number {
  return rounds.reduce<number>((sum, [opponentMove, strategyInput]) => {
    const opponentMovePoints = opponentMoveMap[opponentMove];
    const strategy = resultStrategyMap[strategyInput];
    const myMovePoints = moveForStrategyResult[opponentMovePoints][strategy];

    const myResultForRound = resultForRound[myMovePoints][opponentMovePoints];
    const myPointForRound = pointForRoundResult[myResultForRound];

    return sum + myMovePoints + myPointForRound;
  }, 0)
}

const testData = await Deno.readFile(dirPath + "./test.txt");
const strategyGuideData = await Deno.readFile(dirPath + "./input.txt");

// Test suite
// ----------------
console.log("--- Test ---");
const testSuitResult = getScoreFor(fileToArrayOfRound(testData));
const testSuiteExpected = 12;
console.assert(testSuitResult === testSuiteExpected, testSuitResult, `should be ${testSuiteExpected}`)

// Result for strategy
// --------------------------
console.log("--- Part 1 ---");
console.log("Expected score is ", getScoreFor(fileToArrayOfRound(strategyGuideData)));
