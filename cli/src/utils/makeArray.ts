//transform any input to an array (when array just return array)
export function makeArray<Input>(input: Input | Input[]): Input[] {
  //when input is alredy an array return input
  if (input instanceof Array) return input;

  //else return an array of input
  return [input];
}
