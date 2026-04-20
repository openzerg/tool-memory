FROM oven/bun:alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
COPY tool-memory/package.json tool-memory/bun.lock* ./
RUN bun install
COPY tool-memory/src/ src/
COPY tool-memory/tsconfig.json ./
RUN bun build --compile src/main.ts --outfile tool-memory

FROM docker.io/library/alpine:latest
RUN apk add --no-cache ca-certificates libstdc++
WORKDIR /app
COPY --from=builder /app/tool-memory /app/tool-memory
RUN chmod +x /app/tool-memory
EXPOSE 25030
ENTRYPOINT ["/app/tool-memory"]
