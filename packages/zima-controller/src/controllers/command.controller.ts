import { Request, Response, Router, BaseController } from "shared/controllers";
import {
  LoggerService,
  HttpService,
  BrokerService,
  ConfigService,
  GrpcClientService,
  ServiceDefinition,
} from "shared/services";
import { CommandRespStatuses } from "shared/constants";
import { TelegramServiceDefinition } from "shared-grpc-services/services/telegram_service.js";
import { SmartDevicesServiceDefinition } from "shared-grpc-services/services/smart_devices_service.js";
import { IConfig, IServicesConfig } from "../config/config.js";
import { GrpcServiceTypes } from "../constants/grpc-services.enum.js";

interface IServiceInfo {
  definition: ServiceDefinition;
  address: string;
}

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
    private readonly brokerService: BrokerService,
    private readonly grpcClientService: GrpcClientService
  ) {}

  getRoutes(): Router {
    const router = HttpService.newRouter();

    router.post("/", this.command.bind(this));
    router.post("/instant", this.instantCommand.bind(this));

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

  async instantCommand(req: Request, resp: Response) {
    const { service, action, args } = req.body;
    const { definition, address } = this.getServiceInfoByType(service);

    const channel = await this.grpcClientService.createChannel(address);
    const client = this.grpcClientService.createClient(definition, channel);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await client[action](args);
    channel.close();

    resp.json({ ok: true });
  }

  private getServiceInfoByType(type: GrpcServiceTypes): IServiceInfo {
    const { telegramServiceAddress, smartDevicesServiceAddress } =
      this.configService.get<IServicesConfig>("services");

    switch (type) {
      case GrpcServiceTypes.Telegram: {
        return {
          definition: TelegramServiceDefinition,
          address: telegramServiceAddress,
        };
      }
      case GrpcServiceTypes.SmartDevices: {
        return {
          definition: SmartDevicesServiceDefinition,
          address: smartDevicesServiceAddress,
        };
      }
      default: {
        throw new Error("Unknown service type");
      }
    }
  }
}
