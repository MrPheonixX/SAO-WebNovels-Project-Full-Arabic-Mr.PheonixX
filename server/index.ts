import express from "express";
import cors from "cors";
import { Readable } from "node:stream";
import { handleDemo } from "./routes/demo";
import { isAllowedPdfUrl } from "./pdfSources";

export function createServer() {
  const app = express();

  // Middleware
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  // The SPA and the API are served from the same origin, so CORS is only
  // enabled for origins listed explicitly in CORS_ORIGIN (comma-separated).
  const corsOrigins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  if (corsOrigins.length > 0) {
    app.use(cors({ origin: corsOrigins }));
  }
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Secure PDF proxy to bypass X-Frame-Options of third-party hosts
  app.get("/api/proxy-pdf", async (req, res) => {
    try {
      const url = String(req.query.url || "");
      if (!url || !/^https:\/\//i.test(url)) {
        res.status(400).json({ error: "Invalid url" });
        return;
      }
      if (!isAllowedPdfUrl(url)) {
        res.status(403).json({ error: "Source not allowed" });
        return;
      }

      const headers: Record<string, string> = { Accept: "application/pdf" };
      const rangeHeader = req.headers["range"] as string | undefined;
      if (rangeHeader) headers["Range"] = rangeHeader;

      const upstream = await fetch(url, {
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(20000),
      });
      // github.com/.../raw/... redirects to raw.githubusercontent.com; make
      // sure the final location is still on the allow-list.
      if (upstream.url && !isAllowedPdfUrl(upstream.url)) {
        res.status(403).json({ error: "Source not allowed" });
        return;
      }
      if (!upstream.ok && upstream.status !== 206) {
        res.status(upstream.status || 502).json({ error: "Upstream fetch failed" });
        return;
      }

      const acceptRanges = upstream.headers.get("accept-ranges") || "bytes";
      const contentLength = upstream.headers.get("content-length") || undefined;
      const contentRange = upstream.headers.get("content-range") || undefined;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Accept-Ranges", acceptRanges);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      if (contentLength) res.setHeader("Content-Length", contentLength);
      if (contentRange) res.setHeader("Content-Range", contentRange);

      if (upstream.status === 206) {
        res.status(206);
      }

      if (upstream.body) {
        const nodeStream = Readable.fromWeb(upstream.body as unknown as ReadableStream);
        nodeStream.on("error", () => res.end());
        nodeStream.pipe(res);
      } else {
        const arrayBuf = await upstream.arrayBuffer();
        res.end(Buffer.from(arrayBuf));
      }
    } catch (err) {
      res.status(500).json({ error: "Proxy error" });
    }
  });

  return app;
}
