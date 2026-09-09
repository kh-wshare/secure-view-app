/**
 * Every Go control-plane error response is `{"error":{"code":"...","message":"..."}}`
 * (see the Postman collection's top-level description). `code` is the
 * machine-readable value screens should branch on (e.g. `camera_not_online`);
 * `message` is human-readable fallback text.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
