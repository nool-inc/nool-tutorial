import { createServer, type IncomingMessage, type Server } from "node:http";
import { Router } from "./router.ts";
import { registerRoutes, type Services } from "./routes.ts";

export function buildRouter(services: Services): Router {
  const router = new Router();
  registerRoutes(router, services);
  return router;
}

export function startServer(services: Services, port: number): Server {
  const router = buildRouter(services);
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let body: unknown;
    try {
      body = await readJson(req);
    } catch {
      res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: "body is not JSON" }));
      return;
    }
    const reply = await router.handle({ method: req.method ?? "GET", path: url.pathname, query: Object.fromEntries(url.searchParams), body });
    res.writeHead(reply.status, { "content-type": "application/json" }).end(JSON.stringify(reply.body));
  });
  return server.listen(port);
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let text = "";
  for await (const chunk of req) text += chunk;
  return text ? JSON.parse(text) : undefined;
}
