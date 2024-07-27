import { ConfigService, HttpService, LoggerService } from "shared/services";

import { Config } from "./config/config.js";
import { DiscoveryService } from "./services/discovery.service.js";
import { DiscoveryController } from "./controllers/discovery.controller.js";
import { getApiController } from "./controllers/api.controller.js";

const loggerService = new LoggerService();
const configService = new ConfigService({ config: Config });
const discoveryService = new DiscoveryService();

const discoveryController = new DiscoveryController(loggerService, discoveryService);

const apiController = getApiController(discoveryController);

const httpService = new HttpService(loggerService, configService, apiController);

httpService.start();
