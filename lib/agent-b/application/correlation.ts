export type RequestCorrelation = Readonly<{ requestId: string }>;
export type OperationCorrelation = Readonly<{
  requestId: string;
  operationId: string;
}>;

// Operational identifiers only: not identity, authorization or semantic lineage.
export function createRequestCorrelation(): RequestCorrelation {
  return Object.freeze({ requestId: crypto.randomUUID() });
}

export function createOperationCorrelation(request: RequestCorrelation): OperationCorrelation {
  return Object.freeze({
    requestId: request.requestId,
    operationId: crypto.randomUUID(),
  });
}
