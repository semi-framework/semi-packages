import { prompt } from "../cmd";

export async function askBool(
  message: string,
  defaultValue: boolean = false,
): Promise<boolean> {
  //ask question
  const { confirm } = await prompt({
    type: "confirm",
    name: "confirm",
    message: message,
    default: defaultValue,
  });

  //return answer
  return confirm;
}
