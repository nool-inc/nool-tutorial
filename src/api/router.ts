/** A very small Express-style router. Handlers take a request and return a reply. */
export interface Request {
  method: string;
  path: string;
  query: Record<string, string>;
  body: unknown;
}

export interface Reply {
  status: number;
  body: unknown;
}

export type Handler = (req: Request) => Reply | Promise<Reply>;

export class Router {
  #routes = new Map<string, Handler>();

  get(path: string, handler: Handler): void {
    this.#routes.set(`GET ${path}`, handler);
  }

  post(path: string, handler: Handler): void {
    this.#routes.set(`POST ${path}`, handler);
  }

  async handle(req: Request): Promise<Reply> {
    const handler = this.#routes.get(`${req.method} ${req.path}`);
    if (!handler) return { status: 404, body: { error: `no route for ${req.method} ${req.path}` } };
    try {
      return await handler(req);
    } catch (err) {
      return { status: 500, body: { error: err instanceof Error ? err.message : String(err) } };
    }
  }
}
