import {
  ConfigService,
  BrokerService,
  LoggerService,
} from "shared/services.mjs";
import { CommandRespStatuses } from "shared/constants.mjs";

import { Config } from "./config/config.mjs";
import { Database } from "./database/database.mjs";
import { FormsSeed } from "./seeds/forms-seed.mjs";
import { initCollectionsIfNeeded } from "./seeds/init.mjs";

import { Form } from "./models/forms-model.mjs";

import { FormsService } from "./services/forms-service.mjs";

const loggerService = new LoggerService({});
const configService = new ConfigService({ config: Config });
const brokerService = new BrokerService({ configService, loggerService });
const formsService = new FormsService({ formModel: Form });

const database = new Database({ configService });
await database.connect();
await formsService.removeAll();
await initCollectionsIfNeeded({ formsService, formsSeed: FormsSeed });
await brokerService.createConnection();

const queueName = configService.get("Rabbit.FormsQueueName");

const handleFormsMsg = (_, channel) => async (msg) => {
  let serviceResp = null;

  const { tokens, customEntities } = JSON.parse(msg.content.toString());
  // TODO added on 12.12.21 by pavel.karpovich: add every command to history
  const [form, action] = await formsService.getFormActionByTokens(tokens);

  if (form && action) {
    const props = await formsService.populateActionWithProps(
      { form, action },
      { tokens, customEntities }
    );

    serviceResp = JSON.stringify({
      status: CommandRespStatuses.Ok,
      actionType: action.actionType,
      queueName: form.queueName,
      props,
    });
  } else {
    // TODO added on 12.12.21 by pavel.karpovich: add into unknown commands collection

    serviceResp = JSON.stringify({
      status: CommandRespStatuses.NotFound,
    });
  }

  loggerService.log(`Answered with message: ${serviceResp}`);
  await channel.sendToQueue(msg.properties.replyTo, Buffer.from(serviceResp), {
    correlationId: msg.properties.correlationId,
  });
};

await brokerService.subscribeToChannel(queueName, handleFormsMsg);

console.log(`Start listening queue ${queueName}`);
