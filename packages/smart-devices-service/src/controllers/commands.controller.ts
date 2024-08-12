import { BaseCommandsController } from "shared/controllers";
import { LoggerService } from "shared/services";

import { ActionTypes } from "../constants/action-types.js";
import { YeelightService } from "../services/yeelight-service.js";

type Args = {
    zones: string[];
    brightness?: number;
};

export class CommandsController extends BaseCommandsController {
    constructor(
        private readonly yeelightService: YeelightService,
        loggerService: LoggerService,
    ) {
        super(loggerService);
    }

    async handleAction(name: string, args: Args): Promise<void> {
        this.loggerService.log(`Executing action: ${name}`);

        switch (name) {
            case ActionTypes.SetYeelightRandomColor: {
                await this.yeelightService.setRandomColor(args.zones);
                break;
            }
            case ActionTypes.SetRandomColorInEveryLight: {
                await this.yeelightService.setRandomColorInEveryLight(args.zones);
                break;
            }
            case ActionTypes.TurnOffYeelight: {
                await this.yeelightService.setPower(false, args.zones);
                break;
            }
            case ActionTypes.TurnOnYeelight: {
                await this.yeelightService.setPower(true, args.zones, args.brightness);
                break;
            }
            default: {
                throw new Error(`Unknown action type: ${name}`);
            }
        }

        this.loggerService.success(`Action ${name} executed successfully`);
    }
}
