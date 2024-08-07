import { ConfigService, DiscoveryClientService, HttpClientService, HttpService, LoggerService } from "shared/services";
import { createContainer, registerService, registerFunction, registerValue } from "shared/container";

import { Config } from "./config.js";
import { CommandsController } from "./controllers/commands.controller.js";
import { StreamsService } from "./services/streams.service.js";
import { initApiController } from "./controllers/api.controller.js";

(async () => {
    const container = createContainer();

    container.register({
        config: registerValue(Config()),
        loggerService: registerService(LoggerService),
        httpClientService: registerService(HttpClientService),
        configService: registerService(ConfigService),
        discoveryClientService: registerService(DiscoveryClientService),
        streamsService: registerService(StreamsService),
        commandsController: registerService(CommandsController),
        apiRouter: registerFunction(initApiController),
        httpServer: registerService(HttpService),
    });

    const { discoveryClientService, httpServer } = container.cradle;

    await discoveryClientService.registerModule();
    httpServer.start();
})();
