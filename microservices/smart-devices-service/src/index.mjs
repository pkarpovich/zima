import { Config } from "./config/config.mjs";

import { ConfigService, BrokerService } from "shared/services.mjs";
import { ActionTypes } from "shared/constants.mjs";

import { YeelightService } from "./services/yeelight-service.mjs";

const configService = new ConfigService({ config: Config });
const rabbit = new BrokerService({ configService });
const yeelightService = new YeelightService();

const serviceQueueName = configService.get("Rabbit.SmartDevicesQueueName");

const handleQueueMessage = (_, channel) => async (msg) => {
  const { name, props } = JSON.parse(msg.content.toString());

  switch (name) {
    case ActionTypes.SmartDevices.SetYeelightRandomColor: {
      await yeelightService.setRandomColor();
      break;
    }
    case ActionTypes.SmartDevices.TurnOnYeelight: {
      await yeelightService.setPower(true);
      break;
    }
    case ActionTypes.SmartDevices.TurnOffYeelight: {
      await yeelightService.setPower(false);
    }
  }

  const serviceResp = JSON.stringify({});

  await channel.sendToQueue(msg.properties.replyTo, Buffer.from(serviceResp), {
    correlationId: msg.properties.correlationId,
  });
};

await rabbit.createConnection();
await rabbit.subscribeToChannel(serviceQueueName, handleQueueMessage);
