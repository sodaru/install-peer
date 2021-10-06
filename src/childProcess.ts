import { spawn } from "child_process";

export type CommandResult = {
  stdout?: string;
  stderr?: string;
};

export const childProcess = (
  dir: string,
  command: string,
  args: string[],
  stdout = false,
  stderr = false
): Promise<CommandResult> => {
  return new Promise((resolve, reject) => {
    const outChunks: string[] = [];
    const errorChunks: string[] = [];

    const childProcess = spawn(command, args, {
      cwd: dir,
      windowsHide: true,
      stdio: [
        "inherit",
        stdout ? "pipe" : "inherit",
        stderr ? "pipe" : "inherit"
      ]
    });
    childProcess.on("error", e => {
      reject(e);
    });
    childProcess.stdout?.on("data", chunk => {
      outChunks.push(chunk);
    });
    childProcess.stderr?.on("data", chunk => {
      errorChunks.push(chunk);
    });
    childProcess.on("exit", code => {
      const result: CommandResult = {};
      if (outChunks.length > 0) {
        result.stdout = outChunks.join("");
      }
      if (errorChunks.length > 0) {
        result.stderr = errorChunks.join("");
      }
      if (code == 0) {
        resolve(result);
      } else {
        reject(result);
      }
    });
  });
};
