import {
  ConfigService,
  BrokerService,
  LoggerService,
  Channel,
  ConsumeMessage,
} from "shared/src/services.js";
import { ActionTypes, CommandRespStatuses } from "shared/src/constants.js";
import { FormTypes } from "shared/src/enums.js";

import { Config, IConfig } from "./config/config.js";
import { Database } from "./database/database.js";
import { FormsSeed } from "./seeds/forms-seed.js";
import { initCollectionsIfNeeded } from "./seeds/init.js";

import { Form } from "./models/forms-model.js";
import { Command } from "./models/commands-model.js";

import { FormsService } from "./services/forms-service.js";
import { CommandsService } from "./services/commands-service.js";
import { IActionSchema } from "./models/actions-model.js";

const loggerService = new LoggerService();
const configService = new ConfigService<IConfig>({ config: Config() });
const brokerService = new BrokerService({ configService, loggerService });
const formsService = new FormsService(Form);
const commandsService = new CommandsService(Command);

const database = new Database(configService, loggerService);
await database.connect();
await formsService.removeAll();
await initCollectionsIfNeeded({ formsService, formsSeed: FormsSeed });
await brokerService.createConnection();

const queueName = configService.get<string>("Rabbit.FormsQueueName");

interface IMessageProps {
  correlationId: string;
  replyTo: string;
}

async function processMsgAndSendAnswer(
  channel: Channel,
  msg: { tokens: string[]; customEntities: string[] },
  msgProps: IMessageProps
) {
  let serviceResp = null;
  const { tokens } = msg;
  const [form, action] = await formsService.getFormActionByTokens(tokens);

  if (form.type === FormTypes.System) {
    // eslint-disable-next-line no-use-before-define
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
      { tokens }
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
  channel.sendToQueue(msgProps.replyTo, Buffer.from(serviceResp), {
    correlationId: msgProps.correlationId,
  });
}

async function handleSystemAction(
  action: IActionSchema,
  channel: Channel,
  msgProps: IMessageProps
) {
  switch (action.actionType) {
    case ActionTypes.System.Repeat: {
      const command = await commandsService.getLastExistingCommand();
      if (!command) {
        throw new Error("No command found");
      }

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
    default: {
      throw new Error(`Unknown system action: ${action.actionType}`);
    }
  }
}

function handleFormsMsg(_: unknown, channel: Channel) {
  return async (rawMsg: ConsumeMessage) => {
    const msg = JSON.parse(rawMsg.content.toString());
    await processMsgAndSendAnswer(channel, msg, {
      correlationId: rawMsg.properties.correlationId,
      replyTo: rawMsg.properties.replyTo,
    });
  };
}

await brokerService.subscribeToChannel(queueName, handleFormsMsg);

loggerService.log(`Start listening queue ${queueName}`);
