import express, { Router, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import "express-async-errors";

import { ConfigService } from "./config.service.js";
import { LoggerService } from "./logger.service.js";

export type HttpServiceConfig = {
    port: number;
};

export class HttpService {
    private readonly app: express.Application;

    constructor(
        private readonly loggerService: LoggerService,
        private readonly configService: ConfigService<unknown>,
        private readonly apiRouter: express.Router,
    ) {
        this.app = express();
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
        _: NextFunction,
    ): void {
        this.loggerService.error(err);

        res.status(500).json({
            error: "Internal Server Error",
            code: 500,
        });
    }

    start(cb?: () => void): void {
        const port = this.configService.get("http.port");

        this.app.use("/", this.apiRouter);
        this.app.use(this.handleError);

        this.app.listen(port, cb || (() => this.loggerService.info(`Http server listening on port ${port}`)));
    }
}
