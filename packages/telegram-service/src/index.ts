import { createServer } from "nice-grpc";
import { ConfigService, LoggerService } from "shared/src/services";

import { Config, IConfig } from "./config/config.js";
import { TelegramService } from "./services/telegram-service.js";
import {
  TelegramServiceGrpc,
  TelegramServiceDefinition,
} from "./grpc/telegram-service.grpc.js";

const loggerService = new LoggerService();
const configService = new ConfigService<IConfig>({ config: Config() });

const telegramService = new TelegramService(configService, loggerService);
await telegramService.start();

const telegramServiceGrpc = new TelegramServiceGrpc(telegramService);

const server = createServer();
server.add(TelegramServiceDefinition, telegramServiceGrpc);

await server.listen("127.0.01:50051");
