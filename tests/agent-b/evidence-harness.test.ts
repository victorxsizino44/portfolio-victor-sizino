import assert from "node:assert/strict";
import test from "node:test";
import { acceptCommand, parseRows, HarnessCommandError } from "../helpers/postgres-harness.ts";

test("Evidence harness accepts no-result success without JSON parsing", () => {
  for (const stdout of ["", "DO", "Command completed"]) acceptCommand({ status: 0, stdout, stderr: "" });
});
test("Evidence harness parses only the intended structured stdout channel", () => {
  assert.deepEqual(parseRows({ status: 0, stdout: '{"rows":[{"value":1}]}', stderr: "NOTICE: diagnostic" }), [{ value: 1 }]);
});
test("Evidence harness rejects malformed and non-tabular query output", () => {
  for (const stdout of ["DO", "{}", "null", "[]"]) {
    assert.throws(() => parseRows({ status: 0, stdout, stderr: "" }), /POSTGRES_RESULT/);
  }
});
test("Evidence harness preserves SQLSTATE while withholding raw SQL and stderr", () => {
  const result = { status: 1, stdout: "", stderr: "ERROR: private fixture content (SQLSTATE 22012)" };
  for (const consume of [acceptCommand, parseRows]) {
    assert.throws(() => consume(result), (error: unknown) => error instanceof HarnessCommandError && error.sqlstate === "22012" && !error.message.includes("private"));
  }
});
test("Evidence harness does not treat valid JSON on failed command as success", () => {
  assert.throws(() => parseRows({ status: 1, stdout: '{"rows":[]}', stderr: "" }), /POSTGRES_COMMAND_FAILED/);
  assert.throws(() => acceptCommand({ status: null, stdout: "", stderr: "" }), /POSTGRES_COMMAND_FAILED/);
});
test("Evidence harness does not suppress SQL errors on stderr", () => {
  assert.throws(() => acceptCommand({ status: 0, stdout: "", stderr: "ERROR: failed" }), /POSTGRES_COMMAND_FAILED/);
});
