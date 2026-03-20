import http from "http";
import fs from "fs";
import path from "path";
import { URL } from "url";

const DATA_FILE = path.join(__dirname, "data,json");
const PORT = 3001;

// Load data once at startup
const rooms: object[] = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const base = `http://localhost:${PORT}`;
  const { pathname, searchParams } = new URL(req.url ?? "/", base);

  if (req.method === "GET" && pathname === "/data") {
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const start = (page - 1) * limit;
    const slice = rooms.slice(start, start + limit);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      data: slice,
      page,
      limit,
      total: rooms.length,
      hasMore: start + limit < rooms.length,
    }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
