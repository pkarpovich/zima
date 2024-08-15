import { BaseCommandsController } from "shared/controllers";
import { LoggerService } from "shared/services";

import { ActionTypes } from "../action-types.js";
import { CollectorService } from "../services/collector.service.js";

type Args = {
    applicationName?: string;
};

export class CommandsController extends BaseCommandsController {
    constructor(
        private readonly collectorService: CollectorService,
        loggerService: LoggerService,
    ) {
        super(loggerService);
    }

    async handleAction(name: string, args: Args): Promise<any> {
        this.loggerService.log(`Executing action: ${name}`);

        switch (name) {
            case ActionTypes.GetHistory: {
                return this.collectorService.getAll(args?.applicationName);
            }
            default: {
                throw new Error(`Unknown action type: ${name}`);
            }
        }
    }
}
