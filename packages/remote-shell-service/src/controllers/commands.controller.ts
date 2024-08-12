import { BaseCommandsController, BaseController, Request, Response, Router } from "shared/controllers";
import { HttpService, LoggerService } from "shared/services";

import { ActionTypes } from "../constants/action-types.js";
import { AtvService } from "../services/atv-service.js";

type Args = {
    command: string;
};

export class CommandsController extends BaseCommandsController {
    constructor(
        private readonly atvService: AtvService,
        loggerService: LoggerService,
    ) {
        super(loggerService);
    }

    async handleAction(name: string, args: Args): Promise<string> {
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
