import { RegExp } from "https://cdn.esm.sh/v78/webidl-conversions@3.0.1/es2021/webidl-conversions.js";

const textDecoder = new TextDecoder("utf-8");
const dirPath = new URL(".", import.meta.url).pathname;

const isRunningTest = false;
const testInputPath = dirPath + "./test.txt";
const inputPath = dirPath + "./input.txt";

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const expectedTestResult = 157;

const splitLineHalf = (l: string): [string, string] => [l.slice(0, l.length / 2), l.slice(l.length / 2, l.length)];
const charMatchInLines = ([l1, l2]: [string, string]) => l2[l2.search(new RegExp(`[${l1}]`))];
const charWeight = (char: string) => chars.indexOf(char) + 1;
const sum = (a, b) => a + b;
const logEntry = (e) => console.log(e);

Deno.readFile(isRunningTest ? testInputPath : inputPath)
  .then(
    (res) => textDecoder.decode(res)
      .split(/\n/)
      .map(splitLineHalf)
      .map(charMatchInLines)
      .map(charWeight)
      .reduce(sum, 0)
  )
  .then((r) => {
      if (isRunningTest) {
        console.assert(r === expectedTestResult, r, `should be ${expectedTestResult}`);
      }
      console.log(r);
    }
  );

// Split by line
//   for each
//      split Hald (length/2) ?
//      find letter in both string
//      get weight of letter
//      sum + weight