import type { DiscoveryController } from "./discovery.controller.js";
import { HttpService } from "shared/services";

export function getApiController(discoveryController: DiscoveryController) {
    const router = HttpService.newRouter();
    const discoveryRouter = discoveryController.getRoutes();

    router.use("/discovery", discoveryRouter);

    return router;
}
