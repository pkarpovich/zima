import { Router } from "shared/controllers";
import { HttpService } from "shared/services";

import { CommandsController } from "./commands.controller.js";

export function initApiController(commandsController: CommandsController): Router {
    const router = HttpService.newRouter();

    router.use("/commands", commandsController.getRoutes());

    return router;
}
