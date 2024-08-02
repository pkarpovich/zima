import { ConfigService, DiscoveryClientService, HttpClientService, HttpService, LoggerService } from "shared/services";

import { Config } from "./config.js";
import { CommandsController } from "./controllers/commands.controller.js";
import { StreamsService } from "./services/streams.service.js";
import { initApiController } from "./controllers/api.controller.js";

(async () => {
    const configService = new ConfigService({ config: Config() });
    const loggerService = new LoggerService();
    const httpClientService = new HttpClientService();
    const discoveryClientService = new DiscoveryClientService(httpClientService, loggerService, configService);

    await discoveryClientService.registerModule();

    const streamsService = new StreamsService(configService, loggerService, discoveryClientService, httpClientService);
    const commandsController = new CommandsController(streamsService, loggerService);
    const apiController = initApiController(commandsController);

    const httpServer = new HttpService(loggerService, configService, apiController);
    httpServer.start();
})();
