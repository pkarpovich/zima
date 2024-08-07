import { ConfigService, DiscoveryClientService, HttpClientService, HttpService, LoggerService } from "shared/services";
import { createContainer, registerFunction, registerService, registerValue } from "shared/container";

import { Config } from "./config.js";
import { CommandsController } from "./controllers/commands.controller.js";
import { CollectorService } from "./services/collector.service.js";
import { initApiController } from "./controllers/api.controller.js";

(async () => {
    const container = createContainer();

    container.register({
        config: registerValue(Config()),
        loggerService: registerService(LoggerService),
        httpClientService: registerService(HttpClientService),
        configService: registerService(ConfigService),
        discoveryClientService: registerService(DiscoveryClientService),
        collectorService: registerService(CollectorService),
        commandsController: registerService(CommandsController),
        apiRouter: registerFunction(initApiController),
        httpService: registerService(HttpService),
    });

    const { discoveryClientService, httpService } = container.cradle;

    await discoveryClientService.registerModule();
    httpService.start();
})();
