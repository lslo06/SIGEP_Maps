import http from "node:http"
import { Pool } from "pg"

const port = Number(process.env.PORT || 8100)
const pool = new Pool({
  host: process.env.DB_HOST || "sigep-postgis",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "sigep",
  user: process.env.DB_USER || "sigep_lector",
  password: process.env.DB_PASSWORD,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  })
  response.end(JSON.stringify(payload))
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://localhost")

  if (url.pathname === "/health" && request.method === "GET") {
    try {
      await pool.query("SELECT 1")
      return sendJson(response, 200, { status: "ok" })
    } catch {
      return sendJson(response, 503, { status: "database_unavailable" })
    }
  }

  if (url.pathname !== "/api/predios" || request.method !== "GET") {
    return sendJson(response, 404, { error: "Ruta no encontrada." })
  }

  const clave = (url.searchParams.get("clave") || "").trim()
  if (!clave || clave.length > 100) {
    return sendJson(response, 400, { error: "Indica una clave catastral válida." })
  }

  try {
    const { rows } = await pool.query(
      `SELECT
         id,
         clave_catastral,
         id_predio,
         id_predio_cart,
         status,
         municipio,
         fundo,
         manzana,
         lote,
         superficie,
         ST_AsGeoJSON(geom)::json AS geometry
       FROM predios
       WHERE upper(trim(clave_catastral)) = upper(trim($1))
       LIMIT 1`,
      [clave],
    )

    if (rows.length === 0) {
      return sendJson(response, 404, { error: "Predio no encontrado." })
    }

    const { geometry, ...properties } = rows[0]
    return sendJson(response, 200, {
      type: "Feature",
      geometry,
      properties,
    })
  } catch {
    return sendJson(response, 500, { error: "No fue posible consultar el predio." })
  }
})

server.listen(port, "0.0.0.0", () => {
  console.log(`SIGEP read-only API listening on ${port}`)
})

async function shutdown() {
  server.close()
  await pool.end()
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
