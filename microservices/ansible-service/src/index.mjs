import { ConfigService, BrokerService } from "shared/services.mjs";
import { ActionTypes } from "shared/constants.mjs";

import { Config } from "./config/config.mjs";

import { AnsibleService } from "./services/ansible-service.mjs";
import { VpnService } from "./services/vpn-service.mjs";

const configService = new ConfigService({ config: Config });
const ansibleService = new AnsibleService();
const vpnService = new VpnService({ ansibleService, configService });
const rabbit = new BrokerService({ configService });

const serviceQueueName = configService.get("Rabbit.AnsibleQueueName");

const handleQueueMessage = (_, channel) => async (msg) => {
  const { name, props } = JSON.parse(msg.content.toString());
  let ansibleOutput = {};

  switch (name) {
    case ActionTypes.Ansible.VpnStart: {
      ansibleOutput = await vpnService.start(props.vpnFileName);
      break;
    }
    case ActionTypes.Ansible.VpnStop: {
      ansibleOutput = await vpnService.stop();
      break;
    }
    case ActionTypes.Ansible.VpnStatus: {
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
