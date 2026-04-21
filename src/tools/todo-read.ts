import type { ITool } from "@openzerg/common-typescript/tool-server-sdk"
import { dbOp, type DB, ResultAsync, toAppError } from "./shared.js"
import * as queries from "../generated/queries.js"

export function createTodoRead(db: DB): ITool {
  return {
    name: "todo-read",
    description: "Read the current session task list.",
    group: "todo",
    priority: 10,
    dependencies: [],
    inputSchema: { type: "object", properties: {} },
    outputSchema: { type: "object", properties: { todos: { type: "array" } } },
    execute(_argsJson, sessionToken, getContext) {
      return ResultAsync.fromPromise(getContext(sessionToken), toAppError).andThen((ctx) => {
        const sessionId = ctx.sessionId
        return dbOp(() =>
          queries.selectBySession(db, { sessionId })
        ).map((rows) => ({
          todos: rows.map((r) => ({
            content: r.content,
            status: r.status,
            priority: r.priority,
          })),
        }))
      })
    },
  }
}
