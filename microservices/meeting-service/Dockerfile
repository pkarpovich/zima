FROM golang:1.17-alpine AS builder

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64
RUN go build -ldflags="-s -w" -o meeting-service .

FROM alpine

WORKDIR /app

COPY --from=builder ["/build", "/app"]
ENTRYPOINT ["/app/meeting-service"]