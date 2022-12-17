import { existsSync } from "fs";
import { mkdir, rm, writeFile } from "fs/promises";
import { EOL } from "os";
import path from "path";
import slugify from "slugify";
import { CWD, prompt } from "../cmd";
import { installPackages } from "../utils/installPackages";

//create interface arguments
export interface ICreate {
  force?: boolean;
  name: string;
  path?: string;
  yarn: boolean;
}

//create cli command
export async function create(
  name: string,
  forceYarn: boolean,
  pathname?: string,
  force?: boolean,
) {
  //path constants
  const NAME = slugify(name, { lower: true, strict: true });
  const ROOT_DIR = path.join(CWD, pathname ? pathname : NAME);
  const BACKEND_DIR = path.join(ROOT_DIR, "backend");
  const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
  const PACKAGE_FILE = path.join(ROOT_DIR, "package.json");
  const GITIGNORE_FILE = path.join(ROOT_DIR, ".gitignore");
  const ROOT_FILE = path.join(ROOT_DIR, ".semiroot");

  //check if directory exists
  if (existsSync(ROOT_DIR)) {
    //check if user granted deletion
    let gratend = force !== undefined ? true : await askUser(ROOT_DIR);

    //log error message when force is false
    if (force === false)
      console.error(
        //create === directory
        `Option "force" is set to "false" and directory "${ROOT_DIR}" alredy exists. Aborting!`,
      );

    //exit process when not granted or force is explicitly set to false
    if (force === false || !gratend) process.exit(1);

    //delete the directory
    await rm(ROOT_DIR, { recursive: true });
  }

  //create project directory
  await mkdir(ROOT_DIR, { recursive: true });

  //switch the directory
  process.chdir(ROOT_DIR);

  //create root file
  await writeFile(ROOT_FILE, NAME, "utf-8");

  //package json content
  const PACKAGE_JSON = {
    name: NAME,
    version: "0.0.0",
    description: `Full-Stack ${NAME} project.`,
    license: "MIT",
    prettier: {
      trailingComma: "all",
      tabWidth: 2,
      semi: true,
      singleQuote: false,
    },
    scripts: {
      build: "semi-cli build bundle",
      "build:backend": "semi-cli build backend",
      "build:frontend": "semi-cli build frontend",
      delete: "semi-cli delete bundle",
      "delete:backend": "semi-cli delete backend",
      "delete:frontend": "semi-cli delete frontend",
      format: "semi-cli all",
      "format:backend": "semi-cli backend",
      "formar:frontend": "semi-cli frontend",
      reinstall: "semi-cli reinstall",
    },
  };

  //create package json
  await writeFile(
    PACKAGE_FILE,
    JSON.stringify(PACKAGE_JSON, null, 2) + EOL,
    "utf-8",
  );

  //git ignore content
  const GIT_IGNORE = `# logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# dependencies
node_modules

# dotenv environment variables file
.env
.env.development

# build output
dist
build
bundle

# cached files
.cache

# lock-files
yarn.lock
package-lock.json`;

  //create git ignore
  await writeFile(GITIGNORE_FILE, GIT_IGNORE, "utf-8");

  //install semi cli
  await installPackages("@semi-framework/cli", ROOT_DIR, true, forceYarn);

  //create backend
  await createBackend();

  //create frontend
  await createFrontend();

  //create backend function
  async function createBackend() {
    //create backend directory
    await mkdir(BACKEND_DIR);
  }

  //create frontend function
  async function createFrontend() {
    //create frontend directory
    await mkdir(FRONTEND_DIR);
  }
}

//warn the user that directory is not empty and ask for permission to delete it
async function askUser(directory: string): Promise<boolean> {
  //prompt the user
  const { confirm } = await prompt({
    type: "confirm",
    name: "confirm",
    message: `The directory "${directory}" alredy exists. Do you want to delete it's content?`,
    default: false,
  });

  //return confirmation
  return confirm;
}
