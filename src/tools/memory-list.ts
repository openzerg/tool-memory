import type { ITool } from "@openzerg/common-typescript/tool-server-sdk"
import { getBucket, dbOp, type DB, ResultAsync, toAppError } from "./shared.js"
import * as queries from "../generated/queries.js"

export function createMemoryList(db: DB): ITool {
  return {
    name: "memory-list",
    description: "List all keys in the agent's persistent memory.",
    group: "memory",
    priority: 10,
    dependencies: [],
    inputSchema: { type: "object", properties: {} },
    outputSchema: { type: "object", properties: { entries: { type: "array" } } },
    execute(_argsJson, sessionToken, getContext) {
      return ResultAsync.fromPromise(getContext(sessionToken), toAppError).andThen((ctx) => {
        const bucket = getBucket(ctx)
        return dbOp(() =>
          queries.listByBucket(db, { bucketName: bucket })
        ).map((rows) => ({ entries: rows.map(r => ({ key: r.key, updatedAt: r.updatedAt })) }))
      })
    },
  }
}
