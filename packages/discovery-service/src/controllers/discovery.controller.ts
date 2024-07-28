import { DiscoveryService } from "../services/discovery.service.js";
import { HttpClientService, HttpService, LoggerService } from "shared/services";
import type { Request, Response, Router, BaseController } from "shared/controllers";
import * as console from "node:console";

export class DiscoveryController implements BaseController {
    constructor(
        private readonly loggerService: LoggerService,
        private readonly discoveryService: DiscoveryService,
        private readonly httpClientService: HttpClientService
    ) {}

    getRoutes(): Router {
        const router = HttpService.newRouter();

        router.post("/register", this.register.bind(this));
        router.post("/invoke", this.invoke.bind(this));

        return router;
    }

    register(req: Request, res: Response) {
        const module = req.body;

        this.loggerService.info(`Registering module: ${module.name}`);
        this.discoveryService.register(module);

        res.status(200).send("OK");
    }

    async invoke(req: Request, res: Response) {
        const { name } = req.body;

        this.loggerService.info(`Invoking action: ${name}`);
        const module = this.discoveryService.getModuleByAction(name);

        if (!module) {
            res.status(404).send("Not Found");
            return;
        }

        await this.httpClientService.post(module.address, req.body);

        res.status(200).json({ message: "OK" });
    }
}
