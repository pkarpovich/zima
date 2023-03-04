import { IErrorCatchingConfig } from "shared/services";

export interface IConfig {
  grpc: {
    address: string;
  };

  errors: IErrorCatchingConfig;
}

export function Config(): IConfig {
  return {
    grpc: {
      address: String(process.env.GRPC_ADDRESS),
    },
    errors: {
      isEnable: Boolean(process.env.ERRORS_IS_CATCH_ENABLE),
      name: String(process.env.ERRORS_NAME),
      environment: String(process.env.ERRORS_ENVIRONMENT),
      dsn: String(process.env.ERRORS_DSN),
    },
  };
}
