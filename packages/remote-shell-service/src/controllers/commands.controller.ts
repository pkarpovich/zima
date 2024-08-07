import { BaseController, Request, Response, Router } from "shared/controllers";
import { HttpService, LoggerService } from "shared/services";

import { ActionTypes } from "../constants/action-types.js";
import { AtvService } from "../services/atv-service.js";

type Args = {
    command: string;
};

export class CommandsController implements BaseController {
    constructor(
        private readonly atvService: AtvService,
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
            const output = await this.handleAction(name, args);

            return resp.status(200).json({ message: "OK", response: output });
        } catch (e: any) {
            this.loggerService.error(e.message);
            return resp.status(500).json({ message: e.message });
        }
    }

    private async handleAction(name: string, args: Args): Promise<string> {
        this.loggerService.log(`Executing action: ${name}`);
        let output = "";

        switch (name) {
            case ActionTypes.AppleTvExecute: {
                output = await this.atvService.execute(args.command);
                break;
            }
            default: {
                throw new Error(`Unknown action type: ${name}`);
            }
        }

        this.loggerService.success(`Action ${name} executed successfully`);

        return output;
    }
}
