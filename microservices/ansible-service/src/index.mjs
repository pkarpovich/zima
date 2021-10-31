import { Config } from "./config/config.mjs";

import { AnsibleService } from "./services/ansible-service.mjs";
import { BrokerService } from "./services/broker-service.mjs";
import { ConfigService } from "./services/config-service.mjs";
import { VpnService } from "./services/vpn-service.mjs";

const configService = new ConfigService({ config: Config });
const ansibleService = new AnsibleService();
const vpnService = new VpnService({ ansibleService, configService });
const rabbit = new BrokerService({ configService });

const serviceQueueName = configService.get("Rabbit.AnsibleQueueName");

const AnsiblePlaybooks = {
  VpnStart: "start-vpn",
  VpnStop: "stop-vpn",
  VpnStatus: "vpn-status",
};

const handleQueueMessage = (_, channel) => async (msg) => {
  const { name, props } = JSON.parse(msg.content.toString());
  let ansibleOutput = {};

  switch (name) {
    case AnsiblePlaybooks.VpnStart: {
      ansibleOutput = await vpnService.start(props.vpnFileName);
      break;
    }
    case AnsiblePlaybooks.VpnStop: {
      ansibleOutput = await vpnService.stop();
      break;
    }
    case AnsiblePlaybooks.VpnStatus: {
      break;
    }
  }

  const serviceResp = JSON.stringify(ansibleOutput);

  await channel.sendToQueue(msg.properties.replyTo, Buffer.from(serviceResp), {
    correlationId: msg.properties.correlationId,
  });
};

await rabbit.createConnection();
await rabbit.subscribeToChannel(serviceQueueName, handleQueueMessage);
