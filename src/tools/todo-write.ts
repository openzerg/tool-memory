import type { ITool } from "@openzerg/common-typescript/tool-server-sdk"
import { parseArgs } from "@openzerg/common-typescript/tool-server-sdk"
import { z } from "zod"
import { dbOp, okAsync, type DB, ResultAsync, toAppError } from "./shared.js"
import * as queries from "../generated/queries.js"

const VALID_STATUSES = new Set(["pending", "in_progress", "completed", "cancelled"])
const VALID_PRIORITIES = new Set(["high", "medium", "low"])

const Todo = z.object({
  content: z.string(),
  status: z.string().optional(),
  priority: z.string().optional(),
})

const Args = z.object({ todos: z.array(Todo) })

export function createTodoWrite(db: DB): ITool {
  return {
    name: "todo-write",
    description: "Replace the session task list. Each todo has content, status, and priority.",
    group: "todo",
    priority: 10,
    dependencies: [],
    inputSchema: {
      type: "object",
      properties: {
        todos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              content: { type: "string" },
              status: { type: "string", enum: ["pending", "in_progress", "completed", "cancelled"] },
              priority: { type: "string", enum: ["high", "medium", "low"] },
            },
            required: ["content"],
          },
        },
      },
      required: ["todos"],
    },
    outputSchema: { type: "object", properties: { success: { type: "boolean" } } },
    execute(argsJson, sessionToken, getContext) {
      return parseArgs(Args, argsJson).asyncAndThen((args) => {
        return ResultAsync.fromPromise(getContext(sessionToken), toAppError).andThen((ctx) => {
          const sessionId = ctx.sessionId
          const ts = Number(BigInt(Date.now()))
          return dbOp(async () => {
            await queries.deleteBySession(db, { sessionId })
            for (let position = 0; position < args.todos.length; position++) {
              const t = args.todos[position]
              await queries.insertTodo(db, {
                sessionId,
                position,
                content: t.content,
                status: VALID_STATUSES.has(t.status ?? "") ? t.status! : "pending",
                priority: VALID_PRIORITIES.has(t.priority ?? "") ? t.priority! : "medium",
                ts,
              })
            }
            return { success: true }
          })
        })
      })
    },
  }
}
