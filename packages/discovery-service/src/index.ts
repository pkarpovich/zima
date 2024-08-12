import {
    ConfigService,
    CronService,
    DiscoveryClientService,
    HttpClientService,
    HttpService,
    LoggerService,
} from "shared/services";
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
        cronService: registerService(CronService),
        configService: registerService(ConfigService),
        discoveryClientService: registerService(DiscoveryClientService),
        discoveryService: registerService(DiscoveryService),
        discoveryController: registerService(DiscoveryController),
        apiRouter: registerFunction(getApiController),
        httpServer: registerService(HttpService),
    });

    const { config, httpServer, cronService, discoveryService } = container.cradle;

    cronService.addJob({
        pattern: config.cronTriggerPattern,
        cb: () => discoveryService.pingAllModules(),
    });

    httpServer.start();
})();
