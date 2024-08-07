import * as fs from "node:fs";
import { ConfigService, HttpService, LoggerService, DiscoveryClientService, HttpClientService } from "shared/services";
import { createContainer, registerFunction, registerService, registerValue } from "shared/container";

import { YeelightService } from "./services/yeelight-service.js";
import { CommandsController } from "./controllers/commands.controller.js";
import { initApiController } from "./controllers/api.controller.js";
import { Config } from "./config/config.js";
import { IHomekitDevice } from "./types/homekit-device.type.js";

const devicesConfig = JSON.parse(fs.readFileSync("../devices.json", "utf-8"));

(async () => {
    const container = createContainer();

    container.register({
        config: registerValue(Config()),
        devices: registerValue<IHomekitDevice[]>(devicesConfig.lights),
        loggerService: registerService(LoggerService),
        httpClientService: registerService(HttpClientService),
        configService: registerService(ConfigService),
        discoveryService: registerService(DiscoveryClientService),
        yeelightService: registerService(YeelightService),
        commandsController: registerService(CommandsController),
        apiRouter: registerFunction(initApiController),
        httpService: registerService(HttpService),
    });

    const { discoveryService, httpService } = container.cradle;

    await discoveryService.registerModule();
    httpService.start();
})();
