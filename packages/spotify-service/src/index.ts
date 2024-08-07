import * as fs from "node:fs/promises";
import {
    ConfigService,
    LoggerService,
    LocalDbService,
    FilesService,
    HttpService,
    DiscoveryClientService,
    HttpClientService,
} from "shared/services";
import { createContainer, registerFunction, registerService, registerValue } from "shared/container";

import { Config } from "./config.js";
import { IAuthStore } from "./store.js";
import { SpotifyService } from "./services/spotify-service.js";
import { initApiController } from "./controllers/api.controller.js";
import { SpotifyController } from "./controllers/spotify.controller.js";
import { CommandsController } from "./controllers/commands.controller.js";

(async () => {
    const container = createContainer();
    const DEFAULT_STORE_VALUE: IAuthStore = { refreshToken: null };

    container.register({
        config: registerValue(Config()),
        loggerService: registerService(LoggerService),
        httpClientService: registerService(HttpClientService),
        configService: registerService(ConfigService),
        filesService: registerService(FilesService).inject(() => ({ fileSystem: fs })),
        localDbService: registerService(LocalDbService).inject(() => ({ initialData: DEFAULT_STORE_VALUE })),
    });

    await container.resolve("localDbService").start();

    container.register({
        spotifyService: registerService(SpotifyService),
        discoveryService: registerService(DiscoveryClientService),
        commandsController: registerService(CommandsController),
        spotifyController: registerService(SpotifyController),
        apiRouter: registerFunction(initApiController),
        httpService: registerService(HttpService),
    });

    const { discoveryService, httpService } = container.cradle;

    await discoveryService.registerModule();
    httpService.start();
})();
