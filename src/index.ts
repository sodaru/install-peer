import { childProcess } from "./childProcess";

const ls = async (dir: string): Promise<{ problems?: string[] }> => {
  const result = await childProcess(
    dir,
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["ls", "--json"],
    true
  );

  if (result.stdout) {
    const jsonResult = JSON.parse(result.stdout) as { problems?: string[] };
    return jsonResult;
  } else {
    throw new Error("No stdout from `npm ls --json`");
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
