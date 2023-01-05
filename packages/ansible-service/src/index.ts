import fs from "fs/promises";

import {
  ConfigService,
  BrokerService,
  LoggerService,
  FilesService,
  Channel,
  ConsumeMessage,
} from "shared/services";
import { ActionTypes } from "shared/constants";

import { Config } from "./config/config.js";

import { AnsibleService } from "./services/ansible-service.js";
import { VpnService } from "./services/vpn-service.js";
import { AtvService } from "./services/atv-service.js";

const loggerService = new LoggerService();
const configService = new ConfigService({ config: Config() });
const ansibleService = new AnsibleService(configService);
const filesService = new FilesService(fs);
const vpnService = new VpnService(ansibleService, configService, filesService);
const atvService = new AtvService(configService, loggerService);
const rabbit = new BrokerService({ configService, loggerService });

const serviceQueueName = configService.get<string>("Rabbit.AnsibleQueueName");

function handleQueueMessage(_: unknown, channel: Channel) {
  return async (msg: ConsumeMessage) => {
    const {
      name,
      props,
      args: { command },
    } = JSON.parse(msg.content.toString());
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
      case ActionTypes.Ansible.AppleTvExecute: {
        ansibleOutput = await atvService.execute(command);
        break;
      }
      default: {
        throw new Error(`Unknown action type: ${name}`);
      }
    }

    const serviceResp = JSON.stringify(ansibleOutput);

    channel.sendToQueue(msg.properties.replyTo, Buffer.from(serviceResp), {
      correlationId: msg.properties.correlationId,
    });
  };
}

await rabbit.createConnection();
await rabbit.subscribeToChannel(serviceQueueName, handleQueueMessage);
