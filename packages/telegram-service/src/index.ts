import { ConfigService, LoggerService, GrpcService } from "shared/services";

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

const grpcService = new GrpcService(configService);
grpcService.addService(TelegramServiceDefinition, telegramServiceGrpc);
await grpcService.start();
