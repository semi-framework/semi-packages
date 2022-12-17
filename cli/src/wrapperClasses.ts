import globalYargs, {
  ArgumentsCamelCase,
  Argv,
  Options,
  PositionalOptions,
} from "yargs";
import { makeArray } from "./utils/makeArray";

//type for a command oder command dir
export type CommandOrCommandDir = Command<any> | CommandDir;

//the cli class
export class Cli {
  //the yargs of the cli
  public yargs: Argv;

  //constructor of the cli class
  constructor(modules: CommandOrCommandDir | CommandOrCommandDir[]) {
    //process argv
    const argv = process.argv.slice(2);

    //slice the arguments
    this.yargs = globalYargs(argv);

    //add commands recursive
    this.addCommandsRecursive(makeArray(modules), this.yargs);

    //log help when no args provided
    if (argv.length === 0) this.yargs.showHelp();

    //run argv
    this.yargs.argv;
  }

  //format command
  private formatCommand(name: string, required: boolean) {
    return `${required ? "<" : "["}${name}${required ? ">" : "]"}`;
  }

  //function for adding a command to yargs
  private addCommand(command: Command<{}>, yargsContext: Argv) {
    //positional argument string
    const argumentString = command.arguments
      .map(({ name, options: { demandOption } }) =>
        this.formatCommand(name, !!demandOption),
      )
      .join(" ");

    //add command to yargs context
    yargsContext.command(
      `${command.name}${argumentString ? ` ${argumentString}` : ""}`,
      command.desc,
      (newYargs) => {
        //add all arguments to the command
        command.arguments.forEach((argument) => {
          //add argument to command
          newYargs.positional(argument.name, argument.options);
        });

        //add all flags to the command
        command.flags.forEach((flag) => {
          //add argument to command
          newYargs.option(flag.name, flag.options);
        });

        //disable version for sub commands
        newYargs.version(false);
      },
      command.handler,
    );
  }

  //function for recursivly add commands
  private addCommandsRecursive(
    modules: CommandOrCommandDir[],
    scopedYargs: Argv,
  ) {
    //loop over all modules
    modules.forEach((module) => {
      //check if module is a command
      if (module instanceof Command) {
        //add command to yargs
        this.addCommand(module, scopedYargs);
      }
      //else module is a command dir
      else {
        //add command and call recursive function on sub commands (with new yargs scope)
        scopedYargs.command(
          module.name,
          module.desc,
          (newYargs) => {
            //call recursive function with new yargs scope
            this.addCommandsRecursive(module.modules, newYargs);

            //disable version for sub commands
            newYargs.version(false);
          },
          () => {
            //show help of sub command
            scopedYargs.showHelp();
          },
        );
      }
    });
  }
}

//abstract class that all command classes extend
abstract class BaseCommand {
  //name of command or command dir
  public name: string;

  //description of command or command dir
  public desc: string;

  //constructor of the base class
  constructor(name: string, desc: string) {
    //set name
    this.name = name;

    //set description
    this.desc = desc;
  }
}

//directory for cli commands
export class CommandDir extends BaseCommand {
  //all sub modules (commands or command dirs)
  public modules: CommandOrCommandDir[];

  //constructor of class
  constructor(
    name: string,
    desc: string,
    modules: CommandOrCommandDir | CommandOrCommandDir[] = [],
  ) {
    //construct basic info
    super(name, desc);

    //set modules to an array of modules
    this.modules = makeArray(modules);
  }
}

//type handlerfunction
type HandlerFunction<T> = (args: ArgumentsCamelCase<T>) => void;

//normal cli command
export class Command<T> extends BaseCommand {
  //all arguments for a command
  public arguments: Argument<"positional">[];

  //all arguments for a command
  public flags: Argument<"flag">[];

  //
  public handler: HandlerFunction<T>;

  //constructor of a command
  constructor(
    name: string,
    desc: string,
    handler: HandlerFunction<T>,
    carguments: Argument<"positional"> | Argument<"positional">[] = [],
    flags: Argument<"flag"> | Argument<"flag">[] = [],
  ) {
    //construct basic info
    super(name, desc);

    //set handler
    this.handler = handler;

    //set arguments (before transform)
    this.arguments = makeArray(carguments);

    //last required argument
    const lastRequiredArgumentIndex = this.arguments
      .map((arg) => !!arg.options.demandOption)
      .lastIndexOf(true);

    //generate array of new required arguments
    const newRequired =
      lastRequiredArgumentIndex === -1
        ? new Array(this.arguments.length).fill(false)
        : new Array(this.arguments.length)
            .fill(true, 0, lastRequiredArgumentIndex + 1)
            .fill(false, lastRequiredArgumentIndex + 1, this.arguments.length);

    //update the arguments
    this.arguments = this.arguments.map(
      (argument, idx) =>
        new Argument(argument.name, {
          ...argument.options,
          demandOption: newRequired[idx],
        }),
    );

    //set flags
    this.flags = makeArray(flags);
  }
}

//types of an Argument
type ArgumentType = "positional" | "flag";

//argument for a command
export class Argument<T = ArgumentType> {
  //name of the argument
  public name: string;

  //options of the argument
  public options: T extends "positional" ? PositionalOptions : Options;

  //constructor of a argument
  constructor(
    name: string,
    options?: T extends "positional" ? PositionalOptions : Options,
  ) {
    //set argument name
    this.name = name;

    //set argument options
    this.options = options
      ? { ...options, demandOption: !!options.demandOption }
      : { demandOption: false };
  }
}

//wrapper class for flags
export class Flag extends Argument<"flag"> {}
