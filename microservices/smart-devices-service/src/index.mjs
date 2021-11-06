import { Config } from "./config/config.mjs";

import { BrokerService } from "./services/broker-service.mjs";
import { ConfigService } from "./services/config-service.mjs";
import { YeelightService } from "./services/yeelight-service.mjs";

const configService = new ConfigService({ config: Config });
const rabbit = new BrokerService({ configService });
const yeelightService = new YeelightService();

const serviceQueueName = configService.get("Rabbit.SmartDevicesQueueName");
console.log(serviceQueueName);
const Commands = {
  SetYeelightRandomColor: "set-yeelight-random-color",
};

const handleQueueMessage = (_, channel) => async (msg) => {
  const { name, props } = JSON.parse(msg.content.toString());

  switch (name) {
    case Commands.SetYeelightRandomColor: {
      await yeelightService.setRandomColor();
    }
  }

  const serviceResp = JSON.stringify({});

  await channel.sendToQueue(msg.properties.replyTo, Buffer.from(serviceResp), {
    correlationId: msg.properties.correlationId,
  });
};

await rabbit.createConnection();
await rabbit.subscribeToChannel(serviceQueueName, handleQueueMessage);
