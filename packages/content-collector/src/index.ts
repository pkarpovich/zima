import {
    ConfigService,
    DiscoveryClientService,
    HttpClientService,
    HttpService,
    LoggerService,
    CronService,
} from "shared/services";
import { createContainer, registerFunction, registerService, registerValue } from "shared/container";

import { Config } from "./config.js";
import { CommandsController } from "./controllers/commands.controller.js";
import { CollectorService } from "./services/collector.service.js";
import { initApiController } from "./controllers/api.controller.js";
import { initDatabase } from "./database/database.js";
import { ContentRepository } from "./repositories/content.repository.js";
import { YoutubeService } from "./services/youtube.service.js";
import { PlexService } from "./services/plex.service.js";

(async () => {
    const container = createContainer();
    const config = Config();

    container.register({
        db: registerFunction(initDatabase).inject(() => ({ dbPath: config.dbPath })),
        contentRepository: registerService(ContentRepository),
        config: registerValue(config),
        cronService: registerService(CronService),
        loggerService: registerService(LoggerService),
        httpClientService: registerService(HttpClientService),
        configService: registerService(ConfigService),
        discoveryClientService: registerService(DiscoveryClientService),
        youtubeService: registerService(YoutubeService),
        plexService: registerService(PlexService),
        collectorService: registerService(CollectorService),
        commandsController: registerService(CommandsController),
        apiRouter: registerFunction(initApiController),
        httpService: registerService(HttpService),
    });

    const { discoveryClientService, httpService, contentRepository, cronService, collectorService, configService } =
        container.cradle;

    cronService.addJob({
        pattern: config.cronTriggerPattern,
        cb: () => collectorService.create(),
        startNow: true,
    });

    await contentRepository.init();

    const allowPopulate = configService.get("allowPopulate");
    if (allowPopulate) {
        await collectorService.populate();
    }

    await discoveryClientService.registerModule();
    httpService.start();
})();
