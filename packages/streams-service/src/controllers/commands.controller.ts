import { BaseController, Request, Response, Router } from "shared/controllers";
import { HttpService, LoggerService } from "shared/services";

import { ActionTypes } from "../action-types.js";
import { StreamsService } from "../services/streams.service.js";

type Args = {
    url: string;
};

export class CommandsController implements BaseController {
    constructor(
        private readonly streamsService: StreamsService,
        private readonly loggerService: LoggerService,
    ) {}

    getRoutes(): Router {
        const router = HttpService.newRouter();

        router.post("/execute", this.execute.bind(this));

        return router;
    }

    async execute(req: Request, resp: Response) {
        const { name, args } = req.body;

        try {
            await this.handleAction(name, args);

            return resp.status(200).json({ message: "OK" });
        } catch (e: any) {
            this.loggerService.error(e.message);
            return resp.status(500).json({ message: e.message });
        }
    }

    private async handleAction(name: string, args: Args) {
        this.loggerService.log(`Executing action: ${name}`);

        switch (name) {
            case ActionTypes.Start: {
                await this.streamsService.openUrl(args.url);
                break;
            }
            default: {
                throw new Error(`Unknown action type: ${name}`);
            }
        }

        this.loggerService.success(`Action ${name} executed successfully`);
    }
}
