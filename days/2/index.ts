const dirPath = new URL(".", import.meta.url).pathname;
const textDecoder = new TextDecoder("utf-8");

type OpponentMoveInput = "A" | "B" | "C";
type ResultStrategyInput = "X" | "Y" | "Z";

/**
 * Potential result of a round
 */
enum Result {
  Loose = -1,
  Draw = 0,
  Win = 1
}

/**
 * Move with Point value
 * Point per played move:
 * - Rock: 1 point
 * - Paper: 2 points
 * - Scissors: 3 points
 */
enum Move {
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
const resultForRound: Record<Move, Record<Move, Result>> = {
  [Move.Rock]: {
    [Move.Rock]: Result.Draw,
    [Move.Scissor]: Result.Win,
    [Move.Paper]: Result.Loose
  },
  [Move.Scissor]: {
    [Move.Rock]: Result.Loose,
    [Move.Scissor]: Result.Draw,
    [Move.Paper]: Result.Win
  },
  [Move.Paper]: {
    [Move.Rock]: Result.Win,
    [Move.Scissor]: Result.Loose,
    [Move.Paper]: Result.Draw
  }
};

/**
 * Give the move you should play against the opponent to match the strategy guide
 */
const moveForStrategy: Record<Move, Record<Result, Move>> = {
  [Move.Rock]: {
    [Result.Draw]: Move.Rock,
    [Result.Win]: Move.Paper,
    [Result.Loose]: Move.Scissor
  },
  [Move.Scissor]: {
    [Result.Loose]: Move.Paper,
    [Result.Draw]: Move.Scissor,
    [Result.Win]: Move.Rock
  },
  [Move.Paper]: {
    [Result.Win]: Move.Scissor,
    [Result.Loose]: Move.Rock,
    [Result.Draw]: Move.Paper
  }
};

/**
 * Points obtained by round result
 */
const pointsByResult: Record<Result, number> = {
  [Result.Win]: 6,
  [Result.Draw]: 3,
  [Result.Loose]: 0
};

/**
 * Move by OpponentMoveInput
 */
const opponentMoveInputToMove: Record<OpponentMoveInput, Move> = {
  A: Move.Rock,
  B: Move.Paper,
  C: Move.Scissor
};

/**
 * Result by ResultStrategyInput
 * */
const resultStrategyInputToResult: Record<ResultStrategyInput, Result> = {
  X: Result.Loose,
  Y: Result.Draw,
  Z: Result.Win
};

/*
* Get an array array of round on the form of [Move, Result][], where:
* - first argument; Move is the opponent move
* - second argument: Result is the expected result to match strategy guide
*
* File structure:
* - Each round is separate by a new line
* - Each round contains 3 char: [opponent move][white space][recommended move]
*
*/
function fileToArrayOfRound(file: Uint8Array): [Move, Result][] {
  return textDecoder.decode(file)
    .split(/\n/)
    .map((round) => {
        const [opponentMoveInput, resultStrategyInput] = round.split(/\s/);
        return [
          opponentMoveInputToMove[opponentMoveInput as OpponentMoveInput],
          resultStrategyInputToResult[resultStrategyInput as ResultStrategyInput]
        ];
      }
    );
}


function getScoreFor(rounds: [Move, Result][]): number {
  return rounds.reduce<number>((sum, [opponentMove, strategy]) => {
    const myMove = moveForStrategy[opponentMove][strategy];
    const myResultForRound = resultForRound[myMove][opponentMove];
    const myPointForRound = pointsByResult[myResultForRound];

    return sum + myMove + myPointForRound;
  }, 0);
}

const testData = await Deno.readFile(dirPath + "./test.txt");
const strategyGuideData = await Deno.readFile(dirPath + "./input.txt");

// Test suite
// ----------------
console.log("--- Test ---");
const testSuitResult = getScoreFor(fileToArrayOfRound(testData));
const testSuiteExpected = 12;
console.assert(testSuitResult === testSuiteExpected, testSuitResult, `should be ${testSuiteExpected}`);

// Result for strategy
// --------------------------
console.log("--- Part 1 ---");
console.log("You score is ", getScoreFor(fileToArrayOfRound(strategyGuideData)));
