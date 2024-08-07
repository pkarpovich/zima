import { ConfigService, LoggerService, HttpService, DiscoveryClientService, HttpClientService } from "shared/services";
import { createContainer, registerFunction, registerService, registerValue } from "shared/container";

import { CommandsController } from "./controllers/commands.controller.js";
import { initApiController } from "./controllers/api.controller.js";
import { AtvService } from "./services/atv-service.js";
import { Config } from "./config/config.js";

(async () => {
    const container = createContainer();

    container.register({
        config: registerValue(Config()),
        loggerService: registerService(LoggerService),
        httpClientService: registerService(HttpClientService),
        configService: registerService(ConfigService),
        discoveryService: registerService(DiscoveryClientService),
        atvService: registerService(AtvService),
        commandsController: registerService(CommandsController),
        apiRouter: registerFunction(initApiController),
        httpService: registerService(HttpService),
    });

    const { discoveryService, httpService } = container.cradle;

    await discoveryService.registerModule();
    httpService.start();
})();
