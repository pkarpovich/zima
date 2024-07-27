import { DiscoveryService } from "../services/discovery.service.js";
import { HttpService, LoggerService } from "shared/services";
import type { Request, Response, Router, BaseController } from "shared/controllers";

export class DiscoveryController implements BaseController {
    constructor(private readonly loggerService: LoggerService, private readonly discoveryService: DiscoveryService) {}

    getRoutes(): Router {
        const router = HttpService.newRouter();

        router.post("/register", this.register.bind(this));

        return router;
    }

    register(req: Request, res: Response) {
        const module = req.body;

        this.loggerService.info(`Registering module: ${module.name}`);
        this.discoveryService.register(module);

        res.status(200).send("OK");
    }
}
