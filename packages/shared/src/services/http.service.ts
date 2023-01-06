import { createRequire } from "node:module";
import express, { Router, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import "express-async-errors";

import { ConfigService } from "./config.service.js";
import { LoggerService } from "./logger.service.js";

const require = createRequire(import.meta.url);

// eslint-disable-next-line import/no-commonjs
const apiMetrics = require("prometheus-api-metrics");

export class HttpService {
  private readonly app: express.Application;

  constructor(
    private readonly logService: LoggerService,
    private readonly configService: ConfigService<unknown>,
    private readonly apiRouter: express.Router
  ) {
    this.app = express();
    this.app.use(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      apiMetrics({
        metricsPath: "/metrics",
      })
    );
    this.app.use(helmet());
    this.app.use(bodyParser.json());

    this.handleError = this.handleError.bind(this);
  }

  static newRouter(): express.Router {
    return Router();
  }

  handleError(
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: NextFunction
  ): void {
    this.logService.error(err);

    res.status(500).json({
      error: "Internal Server Error",
      code: 500,
    });
  }

  start(cb?: () => void): void {
    const port = this.configService.get("http.port");

    this.app.use("/", this.apiRouter);
    this.app.use(this.handleError);

    this.app.listen(
      port,
      cb ||
        (() => this.logService.info(`Http server listening on port ${port}`))
    );
  }
}
