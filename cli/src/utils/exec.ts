import { spawn, SpawnOptions } from "child_process";

//exec command wrapper
export function exec(command: string, args: string[], options: SpawnOptions) {
  //create new promise
  return new Promise<number>((resolve, reject) => {
    //spawn child process
    spawn(command, args, options).on("close", (code) => {
      if (code === null) return reject();
      resolve(code);
    });
  });
}
