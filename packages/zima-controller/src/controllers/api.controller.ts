import { Router } from "shared/src/controllers.js";
import { HttpService } from "shared/src/services.js";

import { CommandController } from "./command.controller.js";

export function initApiController(
  commandController: CommandController
): Router {
  const router = HttpService.newRouter();
  const spotifyRouter = commandController.getRoutes();

  router.use("/command", spotifyRouter);

  return router;
}
