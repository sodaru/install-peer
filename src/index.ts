import { childProcess, ChildProcessError, CommandResult } from "./childProcess";

const ls = async (dir: string): Promise<{ problems?: string[] }> => {
  let result: CommandResult = null;
  try {
    result = await childProcess(
      dir,
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["ls", "--json"],
      { return: "on", show: "off" },
      { return: "on", show: "off" }
    );
  } catch (e) {
    if (e instanceof ChildProcessError) {
      result = e.result;
    } else {
      throw e;
    }
  }

  if (result?.stdout) {
    const jsonResult = JSON.parse(result.stdout) as { problems?: string[] };
    return jsonResult;
  } else {
    throw new Error(
      `No stdout from 'npm ls --json'\n${result?.stdout}\n${result?.stderr}`
    );
  }
};

const installDependencies = async (
  dir: string,
  dependencies: string[]
): Promise<void> => {
  await childProcess(dir, process.platform === "win32" ? "npm.cmd" : "npm", [
    "install",
    "--save-dev",
    ...dependencies
  ]);
};

const getRequiredPeerDependencies = async (dir: string): Promise<string[]> => {
  const lsResult = await ls(dir);

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
  dir: string
): Promise<void> => {
  let requiredPeerDependecies = await getRequiredPeerDependencies(dir);
  while (requiredPeerDependecies.length > 0) {
    await installDependencies(dir, requiredPeerDependecies);
    requiredPeerDependecies = await getRequiredPeerDependencies(dir);
  }
};
