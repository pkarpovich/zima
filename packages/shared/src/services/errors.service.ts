import * as Sentry from "@sentry/node";
import "@sentry/tracing";

import { ConfigService } from "./config.service.js";

export interface IErrorCatchingConfig {
  isEnable: boolean;
  name: string;
  environment?: string;
  dsn: string;
}

export function initErrorCatching(configService: ConfigService<unknown>) {
  const { dsn, name, environment, isEnable } =
    configService.get<IErrorCatchingConfig>("errors");

  if (!isEnable) {
    return;
  }

  Sentry.init({
    environment: environment || "local",
    tracesSampleRate: 1.0,
    serverName: name,
    dsn,
  });
}
