import { appendFile, writeFile } from "fs/promises";
import { EOL } from "os";
import path from "path";
import { installPackages } from "./installPackages";

//create semi module
export async function createSemi(BACKEND_DIR: string) {
  //install basic packages
  await installPackages("@semi-framework/utils", BACKEND_DIR);
}

//create express module
export async function createExpress(
  SRC_DIR: string,
  BACKEND_DIR: string,
  useAuth: boolean,
) {
  //constants
  const EXPRESS_FILE = path.join(SRC_DIR, "express.ts");
  const INDEX_FILE = path.join(SRC_DIR, "index.ts");
  const ENV_FILE = path.join(BACKEND_DIR, ".env");

  //install express
  await installPackages("express cors", BACKEND_DIR);

  //install express (dev)
  await installPackages("@types/express @types/cors", BACKEND_DIR, true);

  //add env vars
  await appendFile(ENV_FILE, `PORT=${EOL}CORS=${EOL}`, "utf-8");

  //file content
  const EXPRESS = `import cors from "cors";
import express from "express";
import { env, logger } from "@semi-framework/utils";${
    useAuth ? EOL + 'import { auth } from "./Components/auth";' : ""
  }

//get listening port
const APP_PORT = env("PORT", true, "5000");

//create express app
const app = express();

//configure express app
app.use(express.json());
app.use(cors({ origin: env("CORS", false, "*") }));

//use routers${useAuth ? EOL + 'app.use("/auth", auth.Router);' : ""}

//listen on APP_PORT
app.listen(APP_PORT, () => {
  //log that app is listening
  logger.info(\`Express: App listening on Port \${APP_PORT}!\`);
});

//log that app was created
logger.debug("Express: App created!");
`;

  //write file
  await writeFile(EXPRESS_FILE, EXPRESS, "utf-8");

  //append express in index file
  await appendFile(INDEX_FILE, 'import "./express"', "utf-8");
}

//create auth module
export async function createAuth(COMPONENT_DIR: string, BACKEND_DIR: string) {
  //constants
  const AUTH_FILE = path.join(COMPONENT_DIR, "auth.ts");
  const ENV_FILE = path.join(BACKEND_DIR, ".env");

  //install express
  await installPackages("@semi-framework/node-auth", BACKEND_DIR);

  //add env vars
  await appendFile(
    ENV_FILE,
    `ACCESS_TOKEN_SECRET=${EOL}REFRESH_TOKEN_SECRET=${EOL}TOKEN_EXPIRES_IN=${EOL}`,
    "utf-8",
  );

  //file content
  const AUTH = ``;

  //write file
  await writeFile(AUTH_FILE, AUTH, "utf-8");
}

//create mongoose module
export async function createMongoose(
  COMPONENT_DIR: string,
  BACKEND_DIR: string,
) {
  //constants
  const MONGOOSE_FILE = path.join(COMPONENT_DIR, "mongoose.ts");
  const ENV_FILE = path.join(BACKEND_DIR, ".env");

  //install mongoose
  await installPackages("mongoose", BACKEND_DIR);

  //add env vars
  await appendFile(ENV_FILE, `MONGODB_URL=${EOL}`, "utf-8");

  //file content
  const MONGOOSE = `import { Connection, createConnection } from "mongoose";
import { env, logger } from "@semi-framework/utils";

//create new mongoose connection
export const mongooseConnection = createConnection(
  env("MONGODB_URL", true),
  {},
  (err) => {
    //log all errors occuring (prefere error stack else error message)
    if (err) return logger.error(err.stack ? err.stack : err.message);

    //log create connection
    logger.info("Mongoose: Create connection to MongoDB!");
  },
) as unknown as Connection;

//log that mongoose connection was created
logger.debug("Mongoose: Connection created!");
`;

  //write file
  await writeFile(MONGOOSE_FILE, MONGOOSE, "utf-8");
}

//create redis module
export async function createRedis(COMPONENT_DIR: string, BACKEND_DIR: string) {
  //constants
  const REDIS_FILE = path.join(COMPONENT_DIR, "redis.ts");
  const ENV_FILE = path.join(BACKEND_DIR, ".env");

  //install redis
  await installPackages("ioredis", BACKEND_DIR);

  //add env vars
  await appendFile(ENV_FILE, `REDIS_URL=${EOL}`, "utf-8");

  //file content
  const REDIS = `import Redis from "ioredis";
import { env } from "@semi-framework/utils";

//create new redis client
export const redisClient = new Redis(env("REDIS_URL", true));
`;

  //write file
  await writeFile(REDIS_FILE, REDIS, "utf-8");
}
