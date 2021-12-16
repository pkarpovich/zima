import {
  ConfigService,
  BrokerService,
  LoggerService,
} from "shared/services.mjs";
import { ActionTypes, CommandRespStatuses } from "shared/constants.mjs";

import { Config } from "./config/config.mjs";
import { Database } from "./database/database.mjs";
import { FormsSeed } from "./seeds/forms-seed.mjs";
import { initCollectionsIfNeeded } from "./seeds/init.mjs";

import { Form } from "./models/forms-model.mjs";
import { Command } from "./models/commands-model.mjs";

import { FormsService } from "./services/forms-service.mjs";
import { CommandsService } from "./services/commands-service.mjs";
import { FormTypes } from "shared/form-types.mjs";

const loggerService = new LoggerService({});
const configService = new ConfigService({ config: Config });
const brokerService = new BrokerService({ configService, loggerService });
const formsService = new FormsService({ formModel: Form });
const commandsService = new CommandsService({ commandModel: Command });

const database = new Database({ configService });
await database.connect();
await formsService.removeAll();
await initCollectionsIfNeeded({ formsService, formsSeed: FormsSeed });
await brokerService.createConnection();

const queueName = configService.get("Rabbit.FormsQueueName");

const handleFormsMsg = (_, channel) => async (rawMsg) => {
  const msg = JSON.parse(rawMsg.content.toString());
  await processMsgAndSendAnswer(channel, msg, {
    correlationId: rawMsg.properties.correlationId,
    replyTo: rawMsg.properties.replyTo,
  });
};

const processMsgAndSendAnswer = async (channel, msg, msgProps) => {
  let serviceResp = null;
  const { tokens, customEntities } = msg;
  const [form, action] = await formsService.getFormActionByTokens(tokens);

  if (form.type === FormTypes.System) {
    await handleSystemAction(action, channel, msgProps);
    return;
  }

  const isUnknownCommand = !form || !action;
  await commandsService.create({
    command: tokens.join(" "),
    isUnknownCommand,
  });

  if (!isUnknownCommand) {
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
    serviceResp = JSON.stringify({
      status: CommandRespStatuses.NotFound,
    });
  }

  loggerService.log(`Answered with message: ${serviceResp}`);
  await channel.sendToQueue(msgProps.replyTo, Buffer.from(serviceResp), {
    correlationId: msgProps.correlationId,
  });
};

const handleSystemAction = async (action, channel, msgProps) => {
  switch (action.actionType) {
    case ActionTypes.System.Repeat: {
      const command = await commandsService.getLastExistingCommand();
      await processMsgAndSendAnswer(
        channel,
        {
          tokens: command?.command.split(" "),
          customEntities: [],
        },
        msgProps
      );
      break;
    }
  }
};

await brokerService.subscribeToChannel(queueName, handleFormsMsg);

console.log(`Start listening queue ${queueName}`);
