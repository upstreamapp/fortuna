export class ReportableError extends Error {
  public readonly code: number
  public readonly errors: any
}
