import process from "node:process";
import readline from "node:readline";

const read = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function input(question: string): Promise<string> {
  return new Promise((resolve) => {
    read.question(question, (answer) => {
      read.close();
      resolve(answer);
    });
  });
}
