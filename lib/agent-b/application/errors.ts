export type SafeApplicationError = Readonly<{
  code: "INTERNAL_ERROR";
  message: string;
}>;

// Do not accept arbitrary exception messages, causes or provider payloads.
// Future approved error cases must define their own fixed, safe public messages.
export function createInternalError(): SafeApplicationError {
  return Object.freeze({
    code: "INTERNAL_ERROR",
    message: "Não foi possível concluir a operação.",
  });
}
