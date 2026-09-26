// Test tooling only. Never include raw CLI output in thrown errors: it may
// contain SQL parameters or connection details.
export interface CommandResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

export class HarnessCommandError extends Error {
  readonly sqlstate: string | null;
  constructor(result: CommandResult) {
    super("POSTGRES_COMMAND_FAILED");
    this.sqlstate = (result.stderr + "\n" + result.stdout)
      .match(/SQLSTATE[\s:=]+([A-Z0-9]{5})\b/i)?.[1] ?? null;
  }
}

function assertSuccess(result: CommandResult): void {
  if (result.status !== 0 || /(?:^|\n)\s*(?:ERROR|FATAL):|SQLSTATE[\s:=]+[A-Z0-9]{5}\b/i.test(result.stderr)) {
    throw new HarnessCommandError(result);
  }
}

export function acceptCommand(result: CommandResult): void {
  assertSuccess(result);
  // DO and other commands need not return JSON or any tabular output.
}

export function parseRows(result: CommandResult): unknown[] {
  assertSuccess(result);
  let parsed: unknown;
  try { parsed = JSON.parse(result.stdout); }
  catch { throw new Error("POSTGRES_RESULT_NOT_JSON"); }
  if (typeof parsed !== "object" || parsed === null || !("rows" in parsed) || !Array.isArray(parsed.rows)) {
    throw new Error("POSTGRES_RESULT_NOT_TABULAR");
  }
  return parsed.rows;
}
