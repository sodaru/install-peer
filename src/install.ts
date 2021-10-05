import { spawn } from "child_process";

const ls = (
  dir: string,
  env: Record<string, string> = {}
): Promise<{ problems?: string[] }> => {
  return new Promise((resolve, reject) => {
    const stdOutData: string[] = [];
    const childProcess = spawn(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["ls", "--json"],
      {
        cwd: dir,
        windowsHide: true,
        stdio: "pipe",
        env: { ...process.env, ...env }
      }
    );
    childProcess.on("error", e => {
      reject(e);
    });
    childProcess.stdout?.on("data", chunk => stdOutData.push(chunk));
    childProcess.on("close", () => {
      resolve(JSON.parse(stdOutData.join("")));
    });
  });
};

const installDependencies = (
  dir: string,
  dependencies: string[],
  env: Record<string, string> = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["install", "--save-dev", ...dependencies],
      {
        cwd: dir,
        windowsHide: true,
        stdio: "inherit",
        env: { ...process.env, ...env }
      }
    );
    childProcess.on("error", e => {
      reject(e);
    });
    childProcess.on("close", () => {
      resolve();
    });
  });
};

const getRequiredPeerDependencies = async (
  dir: string,
  env: Record<string, string> = {}
): Promise<string[]> => {
  const lsResult = await ls(dir, env);

  const peerDependencies = lsResult.problems
    ? lsResult.problems
        .filter(prblm => prblm.startsWith("peer dep missing:"))
        .map(prblm =>
          prblm.substring("peer dep missing: ".length, prblm.indexOf(", "))
        )
    : [];

  return peerDependencies;
};

export const installAllPeerDependencies = async (
  dir: string,
  env: Record<string, string> = {}
): Promise<void> => {
  let requiredPeerDependecies = await getRequiredPeerDependencies(dir, env);
  while (requiredPeerDependecies.length > 0) {
    console.info("Installing ");
    console.info(requiredPeerDependecies);
    await installDependencies(dir, requiredPeerDependecies, env);
    requiredPeerDependecies = await getRequiredPeerDependencies(dir, env);
  }
};
