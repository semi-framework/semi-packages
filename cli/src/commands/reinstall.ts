import { rm } from "fs/promises";
import path from "path";
import { CWD, PACKAGE_MANAGER } from "../cmd";
import { exec } from "../utils/exec";

//reinstall interface arguments
export interface ICreate {
  force?: boolean;
  name: string;
  path?: string;
  yarn: boolean;
}

//reinstall cli command
export async function reinstall() {
  //path constants
  const NODE_MODULES_DIR = path.join(CWD, "node_modules");
  const PACKAGE_LOCK = path.join(CWD, "package-lock.json");
  const YARN_LOCK = path.join(CWD, "yarn.lock");

  //delete files
  await rm(NODE_MODULES_DIR, { recursive: true });
  await rm(PACKAGE_LOCK, { force: true });
  await rm(YARN_LOCK, { force: true });

  //reinstall
  exec(PACKAGE_MANAGER, ["install"], { cwd: CWD, stdio: "inherit" });
}
