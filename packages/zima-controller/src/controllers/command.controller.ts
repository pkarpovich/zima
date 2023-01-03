import {
  Request,
  Response,
  Router,
  BaseController,
} from "shared/src/controllers.js";
import {
  LoggerService,
  HttpService,
  BrokerService,
  ConfigService,
} from "shared/src/services.js";
import { CommandRespStatuses } from "shared/src/constants.js";
import { IConfig } from "../config/config.js";

interface CommandResponse {
  actionType: string;
  queueName: string;
  props: unknown[];
  status: number;
}

export class CommandController implements BaseController {
  constructor(
    private readonly logService: LoggerService,
    private readonly configService: ConfigService<IConfig>,
    private readonly brokerService: BrokerService
  ) {}

  getRoutes(): Router {
    const router = HttpService.newRouter();

    router.post("/", this.command.bind(this));

    return router;
  }

  async command(req: Request, resp: Response) {
    const { text, args } = req.body;
    let result: object | null = null;

    const tokens = text.split(" ");
    const customEntities: string[] = [];
    const formsQueueName = this.configService.get<string>(
      "Rabbit.FormsQueueName"
    );

    await this.brokerService.createConnection();
    const commandResp =
      await this.brokerService.sendToChannelWithResponse<CommandResponse>(
        formsQueueName,
        JSON.stringify({
          tokens,
          customEntities,
        })
      );
    if (!commandResp) {
      resp.json({ error: "Command response is null" });
      return;
    }

    const { status, queueName, actionType, props } = commandResp;

    if (status === CommandRespStatuses.Ok) {
      result = await this.brokerService.sendToChannelWithResponse<object>(
        queueName,
        JSON.stringify({ name: actionType, props, args })
      );

      if (!result) {
        return resp.json({ error: "Result is null" });
      }
    }

    resp.json({ tokens, customEntities, status, ...result });
  }
}
