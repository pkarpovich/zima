import { Router } from "shared/controllers";
import { HttpService } from "shared/services";

import { CommandController } from "./command.controller.js";

export function initApiController(
  commandController: CommandController
): Router {
  const router = HttpService.newRouter();
  const commandRouter = commandController.getRoutes();

  router.use("/command", commandRouter);

  return router;
}
