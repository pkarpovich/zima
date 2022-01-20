import express from "express";
import "express-async-errors";
import bodyParser from "body-parser";
import morgan from "morgan";

import { Config } from "./config/config.mjs";

import {
  ConfigService,
  BrokerService,
  LoggerService,
} from "shared/services.mjs";
import { CommandRespStatuses } from "shared/constants.mjs";

const app = express();
app.use(bodyParser.json());
app.use(morgan("tiny"));

const loggerService = new LoggerService({});
const configService = new ConfigService({ config: Config });
const rabbitService = new BrokerService({ configService, loggerService });

const httpPort = configService.get("General.Port") || 3000;

app.post("/command", async (req, resp) => {
  const { text, args } = req.body;
  let result = {};

  const tokens = text.split(" ");
  const customEntities = [];
  const formsQueueName = configService.get("Rabbit.FormsQueueName");

  await rabbitService.createConnection();
  const { status, queueName, actionType, props } =
    await rabbitService.sendToChannelWithResponse(
      formsQueueName,
      JSON.stringify({
        tokens,
        customEntities,
      })
    );

  if (status === CommandRespStatuses.Ok) {
    result = await rabbitService.sendToChannelWithResponse(
      queueName,
      JSON.stringify({ name: actionType, props, args })
    );
  }

  resp.json({ tokens, customEntities, status, ...result });
});

const errorHandler = (err, req, resp, next) => {
  if (err) {
    resp.status(500);
    resp.json({
      error: err.message,
    });
  }

  next(err);
};
app.use(errorHandler);

app.listen(httpPort, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${httpPort}`);
});
