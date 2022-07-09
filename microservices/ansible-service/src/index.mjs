import fs from "fs/promises";

import {
  ConfigService,
  BrokerService,
  LoggerService,
  FilesService,
} from "shared/services.mjs";
import { ActionTypes } from "shared/constants.mjs";

import { Config } from "./config/config.mjs";

import { AnsibleService } from "./services/ansible-service.mjs";
import { VpnService } from "./services/vpn-service.mjs";

const loggerService = new LoggerService({});
const configService = new ConfigService({ config: Config });
const ansibleService = new AnsibleService({ configService });
const filesService = new FilesService(fs);
const vpnService = new VpnService({
  ansibleService,
  configService,
  filesService,
});
const rabbit = new BrokerService({ configService, loggerService });

const serviceQueueName = configService.get("Rabbit.AnsibleQueueName");

const handleQueueMessage = (_, channel) => async (msg) => {
  const { name, props } = JSON.parse(msg.content.toString());
  let ansibleOutput = {};

  switch (name) {
    case ActionTypes.Ansible.VpnStart: {
      ansibleOutput = await vpnService.start(props[0].value);
      break;
    }
    case ActionTypes.Ansible.VpnStop: {
      ansibleOutput = await vpnService.stop();
      break;
    }
    case ActionTypes.Ansible.LoadVpnFiles: {
      ansibleOutput = await vpnService.loadVpnFiles();
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
