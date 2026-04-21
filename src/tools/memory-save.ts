import type { ITool } from "@openzerg/common-typescript/tool-server-sdk"
import { parseArgs } from "@openzerg/common-typescript/tool-server-sdk"
import { z } from "zod"
import { getBucket, dbOp, errAsync, okAsync, type DB, ResultAsync, toAppError } from "./shared.js"
import * as queries from "../generated/queries.js"

const Args = z.object({ key: z.string(), value: z.string() })

export function createMemorySave(db: DB): ITool {
  return {
    name: "memory-save",
    description: "Save a key-value pair to the agent's persistent memory. Overwrites existing value for the same key.",
    group: "memory",
    priority: 10,
    dependencies: [],
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Memory key" },
        value: { type: "string", description: "Memory value (any string content)" },
      },
      required: ["key", "value"],
    },
    outputSchema: { type: "object", properties: { success: { type: "boolean" } } },
    execute(argsJson, sessionToken, getContext) {
      return parseArgs(Args, argsJson).asyncAndThen((args) => {
        return ResultAsync.fromPromise(getContext(sessionToken), toAppError).andThen((ctx) => {
          const bucket = getBucket(ctx)
          const ts = Number(BigInt(Date.now()))
          return dbOp(() =>
            queries.upsert(db, { bucketName: bucket, key: args.key, value: args.value, ts })
          ).map(() => ({ success: true }))
        })
      })
    },
  }
}
