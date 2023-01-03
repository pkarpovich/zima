FROM golang:1.17-alpine AS builder

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o meeting-service .

FROM alpine

WORKDIR /app

COPY --from=builder ["/build", "/app"]
ENTRYPOINT ["/app/meeting-service"]
