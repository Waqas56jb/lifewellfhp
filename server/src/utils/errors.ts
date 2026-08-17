/** Errors that are safe to surface to the client. */
export class AppError extends Error {
  readonly status: number;
  readonly expose: boolean;
  readonly fields: Record<string, string> | undefined;

  constructor(
    message: string,
    status = 500,
    options: { expose?: boolean; fields?: Record<string, string> } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.expose = options.expose ?? status < 500;
    this.fields = options.fields;
  }
}

export const badRequest = (message: string, fields?: Record<string, string>) =>
  new AppError(message, 400, { expose: true, fields });

export const tooManyRequests = (message: string) =>
  new AppError(message, 429, { expose: true });

export const serverError = (message: string) => new AppError(message, 500, { expose: false });
