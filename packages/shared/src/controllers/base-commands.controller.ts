import { BaseController } from "./base.controller.js";
import { Request, Response, Router } from "./types.js";
import { HttpService } from "../services/http.service.js";
import { LoggerService } from "../services/logger.service.js";

export abstract class BaseCommandsController implements BaseController {
    protected constructor(protected readonly loggerService: LoggerService) {}

    getRoutes(): Router {
        const router = HttpService.newRouter();

        router.post("/execute", this.execute.bind(this));
        router.get("/health", (_, resp) => resp.status(200).json({ message: "OK" }));

        return router;
    }

    async execute(req: Request, resp: Response) {
        const { name, args } = req.body;

        try {
            const response = await this.handleAction(name, args);

            return resp.status(200).json({ message: "OK", response });
        } catch (e: any) {
            this.loggerService.error(e.message);
            return resp.status(500).json({ message: e.message });
        }
    }

    abstract handleAction(name: string, args: unknown): Promise<unknown>;
}
