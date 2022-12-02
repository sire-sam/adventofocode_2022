const dirPath = new URL(".", import.meta.url).pathname;
const textDecoder = new TextDecoder("utf-8");

type OpponentMove = "A" | "B" | "C";
type ContenderMove = "X" | "Y" | "Z";

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

const recommendedMoveMap: Record<ContenderMove, MoveAsPoint> = {
  X: MoveAsPoint.Rock,
  Y: MoveAsPoint.Paper,
  Z: MoveAsPoint.Scissor
};

/*
* Get an array array of round on the form of [RecommendedMove, OpponentMove][]
*
* File structure:
* - Each round is separate by a new line
* - Each round contains 3 char: [opponent move][white space][recommended move]
*
* Note:
* - we reverse move order to get opponent move last
*/
function fileToArrayOfRound(file: Uint8Array): [ContenderMove, OpponentMove][] {
  return textDecoder.decode(file)
    .split(/\n/)
    .map((round) => round
      .split(/\s/)
      .reverse() as [ContenderMove, OpponentMove]
    );
}


function getScoreFor(rounds: [ContenderMove, OpponentMove][]): number {
  return rounds.reduce<number>((sum, [myMove, opponentMove]) => {
    const myMovePoints = recommendedMoveMap[myMove];
    const opponentMovePoints = opponentMoveMap[opponentMove];
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
const testSuiteExpected = 15;
console.assert(testSuitResult === testSuiteExpected, testSuitResult, "should be 15")

// Result for recommendations
// --------------------------
console.log("--- Part 1 ---");
console.log("Expected score is ", getScoreFor(fileToArrayOfRound(strategyGuideData)));
