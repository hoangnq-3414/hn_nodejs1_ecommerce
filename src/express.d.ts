declare namespace Express {
  interface Request {
    flash(type: string, message: string): void;
  }
}
