import { createPromptModule } from "inquirer";
import { create, ICreate } from "./commands/create";
import { reinstall } from "./commands/reinstall";
import { isUsingYarn } from "./utils/isUsingYarn";
import { Argument, Cli, Command, CommandDir, Flag } from "./wrapperClasses";

//create prompt module
export const prompt = createPromptModule();

//package manager type
type PackageManager = "yarn" | "npm";

//constants
export const CWD = process.cwd();
export const PACKAGE_MANAGER: PackageManager = isUsingYarn() ? "yarn" : "npm";

//create new Cli
new Cli([
  new Command<ICreate>(
    "create",
    "Create a new Semi project.",
    ({ name, path, yarn, force }) => {
      create(name, yarn, path, force);
    },
    [
      new Argument("name", {
        demandOption: true,
        type: "string",
        description: "The name of a new Semi project.",
      }),
      new Argument("path", {
        demandOption: false,
        type: "string",
        description: "A custom path to the project folder.",
      }),
    ],
    [
      new Flag("yarn", {
        type: "boolean",
        alias: "y",
        default: false,
        description: "Force the usage of yarn as package manager.",
      }),
      new Flag("force", {
        type: "boolean",
        alias: "f",
        description:
          "Force the deletion of possible old contents of a folder (without this flag user will be asked for permission).",
      }),
    ],
  ),
  new Command(
    "reinstall",
    "Reinstall node_modules and regenerate lock files.",
    () => {
      reinstall();
    },
  ),
]);
