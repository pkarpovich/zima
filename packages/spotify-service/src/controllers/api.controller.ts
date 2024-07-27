import { Router } from "shared/controllers";
import { HttpService } from "shared/services";

import { SpotifyController } from "./spotify.controller.js";
import { CommandsController } from "./commands.controller.js";

export function initApiController(
    spotifyController: SpotifyController,
    commandsController: CommandsController
): Router {
    const router = HttpService.newRouter();

    router.use("/spotify", spotifyController.getRoutes());
    router.use("/commands", commandsController.getRoutes());

    return router;
}
