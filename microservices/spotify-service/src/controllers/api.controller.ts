import { Router } from "shared/src/controllers.js";
import { HttpService } from "shared/src/services.js";

import { SpotifyController } from "./spotify.controller.js";

export function initApiController(
  spotifyController: SpotifyController
): Router {
  const router = HttpService.newRouter();
  const spotifyRouter = spotifyController.getRoutes();

  router.use("/spotify", spotifyRouter);

  return router;
}
