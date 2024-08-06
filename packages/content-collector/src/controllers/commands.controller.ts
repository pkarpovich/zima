import { BaseController, Request, Response, Router } from "shared/controllers";
import { HttpService, LoggerService } from "shared/services";

import { ActionTypes } from "../action-types.js";
import { CollectorService } from "../services/collector.service.js";

export class CommandsController implements BaseController {
    constructor(
        private readonly collectorService: CollectorService,
        private readonly loggerService: LoggerService,
    ) {}

    getRoutes(): Router {
        const router = HttpService.newRouter();

        router.post("/execute", this.execute.bind(this));

        return router;
    }

    async execute(req: Request, resp: Response) {
        const { name } = req.body;

        try {
            const response = await this.handleAction(name);

            return resp.status(200).json({ message: "OK", response });
        } catch (e: any) {
            this.loggerService.error(e.message);
            return resp.status(500).json({ message: e.message });
        }
    }

    private async handleAction(name: string) {
        this.loggerService.log(`Executing action: ${name}`);

        switch (name) {
            case ActionTypes.GetHistory: {
                return this.collectorService.getAll();
            }
            default: {
                throw new Error(`Unknown action type: ${name}`);
            }
        }
    }
}
