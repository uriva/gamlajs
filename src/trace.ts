interface StackFrame {
  file: string;
  line: number;
  column: number;
}
const frameToString = ({ line, file, column }: StackFrame) =>
  `${file}:${line}:${column}`;

const parseStackLine = (stackLine: string): StackFrame | null => {
  const matches = RegExp(/\s+at\s+(.+\s)?\(?(.+):(\d+):(\d+)\)?/).exec(
    stackLine,
  );
  if (!matches) {
    console.error(`could not figure out stack line ${stackLine}`);
    return null;
  }
  const [, , file, line, column] = matches;
  return { file, line: parseInt(line), column: parseInt(column) };
};

const parseStackTrace = (trace: string, picker: (lines: string[]) => string) =>
  parseStackLine(picker(trace.split("\n")));

export const currentLocation = (depth: number) => {
  const x = parseStackTrace(new Error().stack as string, (x) => x[depth]);
  return x ? frameToString(x) : "stack line could not be parsed";
};
