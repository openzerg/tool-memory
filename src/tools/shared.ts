import type { ToolContext } from "@openzerg/common-typescript/tool-server-sdk"
import type { DB } from "../db.js"
import { ResultAsync, okAsync, errAsync } from "neverthrow"
import { AppError, ValidationError, NotFoundError, toAppError } from "@openzerg/common-typescript"
import { gelQuery } from "@openzerg/common-typescript/gel"

export function getBucket(ctx: ToolContext): string {
  const memoryConfig = ctx.serverConfigs?.["tool-memory"]
  return memoryConfig?.bucketName ?? ctx.sessionId
}

export function dbOp<T>(fn: () => Promise<T>): ResultAsync<T, AppError> {
  return gelQuery(fn)
}

export { ResultAsync, okAsync, errAsync }
export { AppError, NotFoundError, ValidationError, toAppError }
export type { DB }
