import express from "express";
import "express-async-errors";
import bodyParser from "body-parser";
import morgan from "morgan";
import fs from "fs/promises";

import { Config } from "./config/config.mjs";

import { AnsibleService } from "./services/ansible-service.mjs";
import { SentencesAnalyzerService } from "./services/sentences-analyzer-service.mjs";
import { FormsService } from "./services/forms-service.mjs";
import { VpnQueryForm } from "./models/vpn-query-form.mjs";
import { FilesService } from "./services/files-service.mjs";
import { ConfigService } from "./services/config-service.mjs";
import { VpnService } from "./services/vpn-service.mjs";
import { BrokerService } from "./services/broker-service.mjs";
import { MeetingsQueryForm } from "./models/meetings-query-form.mjs";

const app = express();
app.use(bodyParser.json());
app.use(morgan("tiny"));

const configService = new ConfigService({ config: Config });
const filesService = new FilesService(fs);
const ansibleService = new AnsibleService();
const sentencesAnalyzerService = new SentencesAnalyzerService();
const vpnService = new VpnService({ ansibleService, configService });
const rabbitService = new BrokerService({ configService });

const formsService = new FormsService([
  new VpnQueryForm({ filesService, configService, vpnService }),
  new MeetingsQueryForm({ rabbitService, configService }),
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
