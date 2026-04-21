import { createServer } from "node:http"
import { connectNodeAdapter } from "@connectrpc/connect-node"
import { createToolServer, SessionResolver, bootstrapToolServer, aggregatePkgs } from "@openzerg/common-typescript/tool-server-sdk"
import { openDB } from "./db.js"
import { createMemoryTools } from "./tools/index.js"

const PORT = parseInt(process.env.PORT ?? "25030", 10)
const GEL_DSN = process.env.GEL_DSN ?? "gel://admin@localhost/main?tls_security=insecure"
const REGISTRY_URL = process.env.REGISTRY_URL ?? "http://localhost:25000"
const REGISTRY_TOKEN = process.env.REGISTRY_TOKEN ?? ""
const PUBLIC_URL = process.env.PUBLIC_URL ?? `http://tool-memory:${PORT}`
const HEARTBEAT_SEC = parseInt(process.env.HEARTBEAT_INTERVAL_SEC ?? "30", 10)

async function main() {
  const db = openDB(GEL_DSN)

  const resolver = new SessionResolver({
    registryUrl: REGISTRY_URL,
    registryToken: REGISTRY_TOKEN,
  })

  const tools = createMemoryTools(db)

  const handler = connectNodeAdapter({
    routes: createToolServer({
      tools,
      getContext: (token) => resolver.resolve(token),
      systemContext: `# Memory & Todo Tools\n\nProvides persistent key-value memory and session task management.\nMemory is scoped per bucket (derived from session or configured via role).\nTodos are stored as a special key "__todos__" in the same bucket.`,
    }),
  })

  createServer(handler).listen(PORT, async () => {
    console.log(`tool-memory listening on :${PORT}`)

    if (REGISTRY_URL) {
      await bootstrapToolServer({
        registryUrl: REGISTRY_URL,
        registryToken: REGISTRY_TOKEN,
        instanceType: "tool-memory",
        port: PORT,
        publicUrl: PUBLIC_URL,
        nixPkgs: aggregatePkgs(tools),
        heartbeatIntervalSec: HEARTBEAT_SEC,
      })
    }
  })
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
