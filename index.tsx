import { serve } from "bun";
import { render } from "ink";
import App from "./App";
import { g } from "./global";

const TARGET_URL = "https://news.ycombinator.com";

g.reqs = new Map();
g.server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const targetUrl = new URL(url.pathname + url.search, TARGET_URL);

    g.reqs.set(req, {
      started: Date.now(),
      pathname: url.pathname,
      method: req.method,
      ip: g.server?.requestIP(req)?.address || "-",
    });

    render(<App />);
    try {
      // Forward the request to target server with SSL verification disabled
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });

      // Get response headers but remove content-encoding to prevent double compression
      const newHeaders = new Headers(response.headers);
      newHeaders.delete("content-encoding");
      g.reqs.delete(req);
      render(<App />);

      // Create response with modified headers and status
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    } catch (error) {
      console.error(`Proxy error: ${error}`);
      return new Response(`Proxy error: ${error}`, { status: 500 });
    }
  },
});
(process.env.NODE_TLS_REJECT_UNAUTHORIZED as any) = 0;

const enterAltScreenCommand = "\x1b[?1049h";
const leaveAltScreenCommand = "\x1b[?1049l";
process.stdout.write(enterAltScreenCommand);
process.on("exit", () => {
  process.stdout.write(leaveAltScreenCommand);
});

setInterval(() => {
  render(<App />);
}, 50);
