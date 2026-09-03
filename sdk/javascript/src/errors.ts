export class IndoLicenseError extends Error {
  constructor(
    message: string,
    public readonly errorCode: string,
    public readonly httpStatus = 0,
    public readonly requestId?: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "IndoLicenseError";
  }
}
