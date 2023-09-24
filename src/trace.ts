interface StackFrame {
  file: string;
  line: number;
  column: number;
}
const frameToString = ({ line, file, column }: StackFrame) =>
  `${file}:${line}:${column}`;

const parseStackLine = (stackLine: string): StackFrame => {
  const matches = RegExp(/\s+at\s+(.+\s)?\(?(.+):(\d+):(\d+)\)?/).exec(
    stackLine,
  );
  if (!matches) throw new Error("could not figure out stack line");
  const [, , file, line, column] = matches;
  return { file, line: parseInt(line), column: parseInt(column) };
};

const parseStackTrace = (trace: string, picker: (lines: string[]) => string) =>
  parseStackLine(picker(trace.split("\n")));

export const currentLocation = () =>
  frameToString(parseStackTrace(new Error().stack as string, (x) => x[3]));
