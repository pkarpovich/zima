import { BaseCommandsController } from "shared/controllers";
import { LoggerService } from "shared/services";

import { ActionTypes } from "../action-types.js";
import { StreamsService } from "../services/streams.service.js";

type Args = {
    url: string;
};

export class CommandsController extends BaseCommandsController {
    constructor(
        private readonly streamsService: StreamsService,
        loggerService: LoggerService,
    ) {
        super(loggerService);
    }

    async handleAction(name: string, args: Args) {
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
