import { ConfigService, LoggerService, HttpService, DiscoveryClientService, HttpClientService } from "shared/services";

import { CommandsController } from "./controllers/commands.controller.js";
import { initApiController } from "./controllers/api.controller.js";
import { AtvService } from "./services/atv-service.js";
import { Config } from "./config/config.js";

(async () => {
    const loggerService = new LoggerService();
    const configService = new ConfigService({ config: Config() });
    const atvService = new AtvService(configService, loggerService);

    const commandsController = new CommandsController(atvService, loggerService);
    const apiController = initApiController(commandsController);

    const httpClientService = new HttpClientService();
    const discoveryService = new DiscoveryClientService(httpClientService, loggerService, configService);
    await discoveryService.registerModule();

    const httpService = new HttpService(loggerService, configService, apiController);
    httpService.start();
})();
