import { Router } from "shared/controllers";
import { HttpService } from "shared/services";

import { SpotifyController } from "./spotify.controller.js";

export function initApiController(
  spotifyController: SpotifyController
): Router {
  const router = HttpService.newRouter();
  const spotifyRouter = spotifyController.getRoutes();

  router.use("/spotify", spotifyRouter);

  return router;
}
