import dotenv from "dotenv";
import express from "express";
import "express-async-errors";
import bodyParser from "body-parser";
import morgan from "morgan";

import { Config } from "./config.mjs";
import { GetDirFiles, IsFileExists } from "./fs.mjs";

import { AnsibleService } from "./services/ansible-service.mjs";

dotenv.config();

const port = Config.Port || 3000;
const playbooksDir = Config.PlaybooksDir || "./playbooks";

const app = express();
app.use(bodyParser.json());
app.use(morgan("tiny"));

const ansibleService = new AnsibleService();

app.get("/playbooks", async (_, resp) => {
  const fields = await GetDirFiles(playbooksDir);

  resp.json(fields);
});

app.post("/playbooks", async (req, resp) => {
  const { name, variables } = req.body;
  const playbookName = `${playbooksDir}/${name}`;
  const playbookPath = `${playbookName}.yml`;

  if (!(await IsFileExists(playbookPath))) {
    resp.sendStatus(404);
    return;
  }

  const { code, output } = await ansibleService.run(playbookName, variables);
  resp.json({ code, output });
});

app.use((err, _, resp, next) => {
  if (err) {
    resp.status(500).json({
      error: err.message,
    });
  }

  next(err);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${port}`);
});
