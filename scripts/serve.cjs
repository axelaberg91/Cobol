/* Original code © 2026 axelaberg91. CC BY-NC 4.0. */
"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };
http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400); response.end("Invalid request"); return; }
  const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
  const relative = path.relative(root, file);
  if (relative.startsWith("..") || path.isAbsolute(relative) || relative.split(path.sep).some(part => part.startsWith("."))) {
    response.writeHead(403); response.end("Forbidden"); return;
  }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404); response.end("Not found"); return; }
    response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    response.end(data);
  });
}).listen(port, "127.0.0.1", () => console.log(`Local preview: http://127.0.0.1:${port}`));
