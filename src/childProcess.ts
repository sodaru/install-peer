import { spawn } from "child_process";

export type CommandResult = {
  stdout?: string;
  stderr?: string;
};

type StreamConfig = {
  show: "error" | "on" | "off";
  return: "on" | "off";
};

export class ChildProcessError extends Error {
  private _result: CommandResult = null;

  constructor(result: CommandResult) {
    super(result.stdout + "\nError" + result.stderr);
    this._result = result;
  }

  get result(): CommandResult {
    return this._result;
  }
}

export const childProcess = (
  dir: string,
  command: string,
  args: string[],
  stdout: StreamConfig = { show: "error", return: "off" },
  stderr: StreamConfig = { show: "error", return: "off" }
): Promise<CommandResult> => {
  return new Promise((resolve, reject) => {
    const outChunks: string[] = [];
    const errorChunks: string[] = [];

    const childProcess = spawn(command, args, {
      cwd: dir,
      windowsHide: true,
      stdio: [
        "inherit",
        stdout.show == "on" && stdout.return == "off" ? "inherit" : "pipe",
        stderr.show == "on" && stderr.return == "off" ? "inherit" : "pipe"
      ]
    });
    childProcess.on("error", e => {
      reject(e);
    });
    childProcess.stdout?.on("data", chunk => {
      outChunks.push(chunk);
      if (stdout.show == "on") {
        process.stdout.write(chunk);
      }
    });
    childProcess.stderr?.on("data", chunk => {
      errorChunks.push(chunk);
      if (stderr.show == "on") {
        process.stderr.write(chunk);
      }
    });
    childProcess.on("exit", code => {
      const result: CommandResult = {};
      if (outChunks.length > 0) {
        if (stdout.return == "on") {
          result.stdout = outChunks.join("");
        }
        if (stdout.show == "error" && code != 0) {
          process.stdout.write(outChunks.join(""));
        }
      }
      if (errorChunks.length > 0) {
        if (stderr.return == "on") {
          result.stderr = errorChunks.join("");
        }
        if (stderr.show == "error" && code != 0) {
          process.stderr.write(errorChunks.join(""));
        }
      }
      if (code == 0) {
        resolve(result);
      } else {
        reject(new ChildProcessError(result));
      }
    });
  });
};
