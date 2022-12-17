#! /usr/bin/env node
import { spawn } from "child_process";

spawn(
  "npx",
  ["@semi-framework/cli@latest", "create", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);
