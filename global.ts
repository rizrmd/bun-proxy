import type { Server } from "bun";

export const g = global as unknown as {
  server: Server | null;
  targetUrl: string;
  reqs: Map<
    Request,
    { started: number; pathname: string; method: string; ip: string }
  >;
};
