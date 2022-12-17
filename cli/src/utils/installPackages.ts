import { PACKAGE_MANAGER } from "../cmd";
import { exec } from "./exec";

//install packages
export async function installPackages(
  packages: string,
  directory: string,
  dev: boolean = false,
  forceYarn: boolean = false,
) {
  //build the command
  const installCommand =
    PACKAGE_MANAGER === "yarn" || forceYarn ? "add" : "install";
  const installArguments = [installCommand, ...packages.split(" ").reverse()];

  //add dev flag if enabled
  if (dev) installArguments.push("-D");

  //run the command
  const code = await exec(
    forceYarn ? "yarn" : PACKAGE_MANAGER,
    installArguments,
    {
      stdio: "inherit",
      cwd: directory,
    },
  );

  //exit process when install errors
  if (code !== 0) {
    process.exit(code);
  }
}
