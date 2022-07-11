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
import { SimpleTriggerService } from "./services/simple-trigger-service.mjs";

const loggerService = new LoggerService({});
const configService = new ConfigService({ config: Config });
const rabbit = new BrokerService({ configService, loggerService });
const yeelightService = new YeelightService({
  yeelightConfig: devicesConfig.lights,
});
const simpleTriggerService = new SimpleTriggerService({
  config: devicesConfig.triggers,
});

const serviceQueueName = configService.get("Rabbit.SmartDevicesQueueName");

const handleQueueMessage = (_, channel) => async (msg) => {
  const { name, args: { zones, command } = { zones: [], command: "" } } =
    JSON.parse(msg.content.toString());

  switch (name) {
    case ActionTypes.SmartDevices.SetYeelightRandomColor: {
      await yeelightService.setRandomColor(zones);
      break;
    }
    case ActionTypes.SmartDevices.SetRandomColorInEveryLight: {
      await yeelightService.setRandomColorInEveryLight(zones);
      break;
    }
    case ActionTypes.SmartDevices.TurnOnYeelight: {
      await yeelightService.setPower(true, zones);
      break;
    }
    case ActionTypes.SmartDevices.TurnOffYeelight: {
      await yeelightService.setPower(false, zones);
      break;
    }
  }

  const serviceResp = JSON.stringify({});

  await channel.sendToQueue(msg.properties.replyTo, Buffer.from(serviceResp), {
    correlationId: msg.properties.correlationId,
  });
};

await rabbit.createConnection();
await rabbit.subscribeToChannel(serviceQueueName, handleQueueMessage);
