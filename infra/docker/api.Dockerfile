FROM golang:1.26-alpine AS builder

WORKDIR /build

RUN apk add --no-cache git

COPY apps/api/go.mod apps/api/go.sum ./
RUN go mod download

RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

COPY apps/api/ ./

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server/main.go

FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /go/bin/migrate .
COPY --from=builder /build/server .
COPY --from=builder /build/migrations ./migrations

EXPOSE 8080

CMD ["./server"]