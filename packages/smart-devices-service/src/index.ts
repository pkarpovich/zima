import * as fs from "node:fs";
import { ConfigService, HttpService, LoggerService, DiscoveryClientService, HttpClientService } from "shared/services";

import { YeelightService } from "./services/yeelight-service.js";
import { CommandsController } from "./controllers/commands.controller.js";
import { initApiController } from "./controllers/api.controller.js";
import { Config } from "./config/config.js";

const devicesConfig = JSON.parse(fs.readFileSync("../devices.json", "utf-8"));

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
