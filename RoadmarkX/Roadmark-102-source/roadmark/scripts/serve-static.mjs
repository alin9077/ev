import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
const root = path.resolve("out");
const mime = {
  ".html": "text/html",
  ".json": "application/json",
  ".md": "text/markdown",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const target = path.resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }
    let file;
    for (const candidate of [
      target,
      `${target}.html`,
      path.join(target, "index.html"),
    ]) {
      if (
        await stat(candidate).then(
          (s) => s.isFile(),
          () => false,
        )
      ) {
        file = candidate;
        break;
      }
    }
    response.statusCode = file ? 200 : 404;
    file ||= path.join(root, "404.html");
    response.setHeader(
      "Content-Type",
      `${mime[path.extname(file)] || "application/octet-stream"}; charset=utf-8`,
    );
    response.end(await readFile(file));
  } catch {
    response.writeHead(500).end("Unable to serve file");
  }
});
server.listen(Number(process.env.PORT || 3012), "127.0.0.1", () =>
  console.log("Static preview ready on http://127.0.0.1:3012"),
);
