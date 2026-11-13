import type { Reply } from "./router.ts";
import type { Services } from "./routes.ts";

// Module 02 of the course makes this a real endpoint. See course/02-first-change.md.
export function health(_services: Services): Reply {
  return { status: 501, body: { error: "not implemented yet" } };
}
