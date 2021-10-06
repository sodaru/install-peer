import { installAllPeerDependencies } from "./index";

const dir = process.argv[2] || process.cwd();

installAllPeerDependencies(dir)
  .then(() => {
    console.log("Done");
  })
  .catch(err => {
    console.error("Error Occurred");
    console.error(err);
  });
