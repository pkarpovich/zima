import { DiscoveryService } from "../services/discovery.service.js";
import { HttpClientService, HttpService, LoggerService, isHttpError } from "shared/services";
import type { Request, Response, Router, BaseController } from "shared/controllers";
import * as console from "node:console";

type BaseServiceResponse = {
    response?: string;
};

export class DiscoveryController implements BaseController {
    constructor(
        private readonly loggerService: LoggerService,
        private readonly discoveryService: DiscoveryService,
        private readonly httpClientService: HttpClientService,
    ) {}

    getRoutes(): Router {
        const router = HttpService.newRouter();

        router.post("/register", this.register.bind(this));
        router.get("/health", this.healthCheck.bind(this));
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
            this.loggerService.error(`Action not found: ${name}`);
            res.status(404).send("Not Found");
            return;
        }

        let response = null;

        try {
            const { data } = await this.httpClientService.post<BaseServiceResponse>(module.address, req.body);
            if (data) {
                response = data.response;
            }
        } catch (e: unknown) {
            if (!isHttpError(e)) {
                this.loggerService.error(e as Error);
                return res.status(500).send("Internal Server Error");
            }

            switch (e.code) {
                case "ECONNREFUSED": {
                    this.loggerService.error(`Error invoking action: ${name} - Connection Refused`);
                    this.discoveryService.deregister(module.name);
                    this.loggerService.info(`Deregistered module: ${module.name}`);
                    break;
                }
                default: {
                    this.loggerService.error(`Error invoking action: ${name} - ${e.message}`);
                    console.error(e.toJSON());
                    break;
                }
            }

            return res.status(500).json(e.toJSON());
        }

        res.status(200).json({ message: "OK", response });
    }

    healthCheck(_: Request, res: Response) {
        const modules = this.discoveryService.getModules();

        res.json({
            modules: modules.length,
            status: "OK",
        });
    }
}
