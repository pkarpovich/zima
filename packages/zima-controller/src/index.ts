import {
  ConfigService,
  LoggerService,
  BrokerService,
  HttpService,
} from "shared/services";
import { Config, IConfig } from "./config/config.js";
import { initApiController } from "./controllers/api.controller.js";
import { CommandController } from "./controllers/command.controller.js";

const loggerService = new LoggerService();
const configService = new ConfigService<IConfig>({ config: Config() });
const brokerService = new BrokerService({ configService, loggerService });

const commandController = new CommandController(
  loggerService,
  configService,
  brokerService
);
const appRouter = initApiController(commandController);

const httpService = new HttpService(loggerService, configService, appRouter);

httpService.start();
