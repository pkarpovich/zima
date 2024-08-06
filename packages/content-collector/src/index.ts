import { ConfigService, DiscoveryClientService, HttpClientService, HttpService, LoggerService } from "shared/services";

import { Config } from "./config.js";
import { CommandsController } from "./controllers/commands.controller.js";
import { CollectorService } from "./services/collector.service.js";
import { initApiController } from "./controllers/api.controller.js";

(async () => {
    const configService = new ConfigService({ config: Config() });
    const loggerService = new LoggerService();
    const httpClientService = new HttpClientService();
    const discoveryClientService = new DiscoveryClientService(httpClientService, loggerService, configService);

    await discoveryClientService.registerModule();

    const collectorService = new CollectorService(discoveryClientService, loggerService);
    const commandsController = new CommandsController(collectorService, loggerService);
    const apiController = initApiController(commandsController);

    const httpServer = new HttpService(loggerService, configService, apiController);
    httpServer.start();
})();
