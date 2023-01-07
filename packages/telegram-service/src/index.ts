import { createServer } from "nice-grpc";
import { ConfigService, LoggerService } from "shared/services";

import { Config, IConfig } from "./config/config.js";
import { TelegramService } from "./services/telegram-service.js";
import {
  TelegramController,
  TelegramServiceDefinition,
} from "./controllers/telegram-controller.js";

const loggerService = new LoggerService();
const configService = new ConfigService<IConfig>({ config: Config() });

const telegramService = new TelegramService(configService, loggerService);
await telegramService.start();

const telegramServiceGrpc = new TelegramController(telegramService);

const server = createServer();
server.add(TelegramServiceDefinition, telegramServiceGrpc);

await server.listen("127.0.0.1:50051");
