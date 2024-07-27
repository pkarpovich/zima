import * as fs from "node:fs/promises";
import { ConfigService, LoggerService, LocalDbService, FilesService, HttpService } from "shared/services";

import { Config } from "./config.js";
import { IAuthStore } from "./store.js";
import { SpotifyService } from "./services/spotify-service.js";
import { initApiController } from "./controllers/api.controller.js";
import { SpotifyController } from "./controllers/spotify.controller.js";
import { CommandsController } from "./controllers/commands.controller.js";

const DEFAULT_STORE_VALUE: IAuthStore = { refreshToken: null };

const filesService = new FilesService(fs);
const configService = new ConfigService({ config: Config() });
const localDbService = new LocalDbService<IAuthStore>(DEFAULT_STORE_VALUE, configService, filesService);
await localDbService.start();
const loggerService = new LoggerService();
const spotifyService = new SpotifyService({
    localDbService,
    configService,
    loggerService,
});

const spotifyController = new SpotifyController(spotifyService, loggerService);
const commandsController = new CommandsController(spotifyService, loggerService);
const apiRouter = initApiController(spotifyController, commandsController);
const httpService = new HttpService(loggerService, configService, apiRouter);
httpService.start();
