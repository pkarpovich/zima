import { ConfigService, HttpService, LoggerService, DiscoveryClientService, HttpClientService } from "shared/services";
import { Config } from "./config/config.js";

import { YeelightService } from "./services/yeelight-service.js";
import { CommandsController } from "./controllers/commands.controller.js";
import { initApiController } from "./controllers/api.controller.js";

import devicesConfig from "../devices.json";

(async () => {
    const configService = new ConfigService({ config: Config() });

    const loggerService = new LoggerService();
    const yeelightService = new YeelightService(devicesConfig.lights);

    const commandsController = new CommandsController(yeelightService, loggerService);
    const apiController = initApiController(commandsController);

    const httpService = new HttpService(loggerService, configService, apiController);
    httpService.start();

    const httpClientService = new HttpClientService();
    const discoveryService = new DiscoveryClientService(httpClientService, loggerService, configService);
    await discoveryService.registerModule();
})();
