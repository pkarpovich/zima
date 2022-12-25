import { createServer } from "nice-grpc";

import {
  ConfigService,
  LoggerService,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
} from "shared/services.mjs";

import { Config } from "./config/config.js";
import { TelegramService } from "./services/telegram-service.js";
import {
  TelegramServiceGrpc,
  TelegramServiceDefinition,
} from "./grpc/telegram-service.grpc.js";

const loggerService = new LoggerService({});
const configService = new ConfigService({ config: Config() });

const telegramService = new TelegramService(configService, loggerService);
await telegramService.start();

const telegramServiceGrpc = new TelegramServiceGrpc(telegramService);

const server = createServer();
server.add(TelegramServiceDefinition, telegramServiceGrpc);

await server.listen("127.0.01:50051");
