import { ConfigService, HttpClientService, HttpService, LoggerService } from "shared/services";
import { createContainer, registerFunction, registerService, registerValue } from "shared/container";

import { Config } from "./config/config.js";
import { DiscoveryService } from "./services/discovery.service.js";
import { DiscoveryController } from "./controllers/discovery.controller.js";
import { getApiController } from "./controllers/api.controller.js";

(async () => {
    const container = createContainer();

    container.register({
        config: registerValue(Config),
        loggerService: registerService(LoggerService),
        httpClientService: registerService(HttpClientService),
        configService: registerService(ConfigService),
        discoveryService: registerService(DiscoveryService),
        discoveryController: registerService(DiscoveryController),
        apiRouter: registerFunction(getApiController),
        httpServer: registerService(HttpService),
    });

    const { httpServer } = container.cradle;

    httpServer.start();
})();
