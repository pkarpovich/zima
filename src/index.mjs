import express from "express";
import "express-async-errors";
import bodyParser from "body-parser";
import morgan from "morgan";
import fs from "fs/promises";

import { Config } from "./config/config.mjs";

import {
  ConfigService,
  FilesService,
  BrokerService,
  LoggerService,
} from "shared/services.mjs";

import { SentencesAnalyzerService } from "./services/sentences-analyzer-service.mjs";
import { FormsService } from "./services/forms-service.mjs";
import { VpnQueryForm } from "./models/vpn-query-form.mjs";
import { MeetingsQueryForm } from "./models/meetings-query-form.mjs";
import { SmartDevicesQueryForm } from "./models/smart-devices-form.mjs";

const app = express();
app.use(bodyParser.json());
app.use(morgan("tiny"));

const loggerService = new LoggerService({});
const configService = new ConfigService({ config: Config });
const filesService = new FilesService(fs);
const sentencesAnalyzerService = new SentencesAnalyzerService();
const rabbitService = new BrokerService({ configService, loggerService });

const formsService = new FormsService([
  new VpnQueryForm({ rabbitService, filesService, configService }),
  new MeetingsQueryForm({ rabbitService, configService }),
  new SmartDevicesQueryForm({ rabbitService, configService }),
]);

const httpPort = configService.get("General.Port") || 3000;

app.post("/command", async (req, resp) => {
  const { text } = req.body;

  const { tokens, customEntities } = sentencesAnalyzerService.analyze(text);
  const result = await formsService.findAndExecute(tokens, customEntities);

  resp.json({ tokens, customEntities, ...result });
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
