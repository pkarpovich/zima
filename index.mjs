import express from "express";

import { Config } from "./config.mjs";

const port = Config.Port || 3000;

const app = express();

app.get("/playbooks", (req, resp) => {
  resp.json({ ok: true });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${port}`);
});
