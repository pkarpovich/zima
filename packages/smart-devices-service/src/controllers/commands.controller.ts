import { BaseController, Request, Response, Router } from "shared/controllers";
import { HttpService, LoggerService } from "shared/services";
import { runFunctionWithRetry } from "shared/utils";

import { ActionTypes } from "../constants/action-types.js";
import { YeelightService } from "../services/yeelight-service.js";

type Args = {
    zones: string[];
    brightness?: number;
};

export class CommandsController implements BaseController {
    constructor(private readonly yeelightService: YeelightService, private readonly loggerService: LoggerService) {}

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
