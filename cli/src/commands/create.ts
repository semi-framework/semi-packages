import { existsSync } from "fs";
import { mkdir, rm, writeFile } from "fs/promises";
import { EOL } from "os";
import path from "path";
import slugify from "slugify";
import { CWD, prompt } from "../cmd";
import { askBool } from "../utils/asks";
import {
  createAuth,
  createExpress,
  createMongoose,
  createRedis,
  createSemi,
} from "../utils/createModules";
import { exec } from "../utils/exec";
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
  const ENV_FILE = path.join(BACKEND_DIR, ".env");

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
  await writeFile(ROOT_FILE, ROOT_DIR, "utf-8");

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
      cli: "semi-cli",
      delete: "semi-cli delete bundle",
      format: "semi-cli format all",
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
    //constants
    const SRC_DIR = path.join(BACKEND_DIR, "src");
    const COMPONENT_DIR = path.join(SRC_DIR, "Components");
    const PACKAGE_FILE = path.join(BACKEND_DIR, "package.json");
    const INDEX_FILE = path.join(SRC_DIR, "index.ts");

    //create backend directory
    await mkdir(BACKEND_DIR);

    //create env file
    await writeFile(ENV_FILE, "DEBUG=1" + EOL, "utf-8");

    //create src directory
    await mkdir(SRC_DIR);

    //package json content
    const PACKAGE_JSON = {
      name: "backend",
      version: "0.0.0",
      main: "dist/index.js",
      description: `Backend of ${NAME} project.`,
      license: "MIT",
      scripts: {
        build: "semi-cli build backend",
        cli: "semi-cli",
        delete: "semi-cli delete backend",
        dev: "semi-cli start backend",
        format: "semi-cli format backend",
        reinstall: "semi-cli reinstall",
        start: "node .",
      },
    };

    //create package json
    await writeFile(
      PACKAGE_FILE,
      JSON.stringify(PACKAGE_JSON, null, 2) + EOL,
      "utf-8",
    );

    //install basic packages (dev)
    await installPackages("@types/node @semi-framework/cli", BACKEND_DIR, true);

    //create ts config
    await exec("./node_modules/.bin/tsc", ["--init", "--outDir", "dist"], {
      cwd: BACKEND_DIR,
    });

    //create basic index
    await writeFile(INDEX_FILE, "", "utf-8");

    //create component directory
    await mkdir(COMPONENT_DIR);

    //create semi
    await createSemi(BACKEND_DIR);

    //ask for express
    const express = await askBool(
      "Do you want to add express (webserver)?",
      true,
    );

    //define auth
    let auth = false;

    //ask for auth when express is used
    if (express)
      auth = await askBool(
        "Do you want to add @semi-framework/node-auth (Backend authentication handler)?",
        true,
      );

    //ask for mongoose
    const mongoose = await askBool(
      "Do you want to add mongoose (database)?",
      true,
    );

    //ask for redis
    const redis = await askBool(
      "Do you want to add ioredis (RAM database)?",
      true,
    );

    //handle express
    if (express) await createExpress(SRC_DIR, BACKEND_DIR, auth);

    //handle auth
    if (auth) await createAuth(COMPONENT_DIR, BACKEND_DIR);

    //handle mongoose
    if (mongoose) await createMongoose(COMPONENT_DIR, BACKEND_DIR);

    //handle redis
    if (redis) await createRedis(COMPONENT_DIR, BACKEND_DIR);
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
