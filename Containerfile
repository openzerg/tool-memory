FROM oven/bun:alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY src/ src/
COPY tsconfig.json ./
RUN bun build --compile src/main.ts --outfile tool-memory

FROM docker.io/library/alpine:latest
RUN apk add --no-cache ca-certificates libstdc++
WORKDIR /app
COPY --from=builder /app/tool-memory /app/tool-memory
RUN chmod +x /app/tool-memory
EXPOSE 25030
ENTRYPOINT ["/app/tool-memory"]
