import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { Config } from "./config/config.mjs";
const devicesConfig = require("../devices.json");

import {
  ConfigService,
  BrokerService,
  LoggerService,
} from "shared/services.mjs";
import { ActionTypes } from "shared/constants.mjs";

import { YeelightService } from "./services/yeelight-service.mjs";

const loggerService = new LoggerService({});
const configService = new ConfigService({ config: Config });
const rabbit = new BrokerService({ configService, loggerService });
const yeelightService = new YeelightService({ yeelightConfig: devicesConfig });

const serviceQueueName = configService.get("Rabbit.SmartDevicesQueueName");

const handleQueueMessage = (_, channel) => async (msg) => {
  const { name, props } = JSON.parse(msg.content.toString());

  switch (name) {
    case ActionTypes.SmartDevices.SetYeelightRandomColor: {
      await yeelightService.setRandomColor();
      break;
    }
    case ActionTypes.SmartDevices.SetRandomColorInEveryLight: {
      await yeelightService.setRandomColorInEveryLight();
      break;
    }
    case ActionTypes.SmartDevices.TurnOnYeelight: {
      await yeelightService.setPower(true);
      break;
    }
    case ActionTypes.SmartDevices.TurnOffYeelight: {
      await yeelightService.setPower(false);
      break;
    }
    case ActionTypes.SmartDevices.StartFlowMode: {
      await yeelightService.startFlowMode();
      break;
    }
    case ActionTypes.SmartDevices.StopFlowMode: {
      await yeelightService.stopFlowMode();
    }
  }

  const serviceResp = JSON.stringify({});

  await channel.sendToQueue(msg.properties.replyTo, Buffer.from(serviceResp), {
    correlationId: msg.properties.correlationId,
  });
};

await rabbit.createConnection();
await rabbit.subscribeToChannel(serviceQueueName, handleQueueMessage);
