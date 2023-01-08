export interface IServicesConfig {
  telegramServiceAddress: string;
}

export interface IConfig {
  Rabbit: {
    Url: string;
    FormsQueueName: string;
  };
  http: {
    port: number;
  };
  services: IServicesConfig;
}

export function Config(): IConfig {
  return {
    Rabbit: {
      Url: String(process.env.AMQP_SERVER_URL),
      FormsQueueName: String(process.env.AMQP_FORMS_QUEUE_NAME),
    },

    http: {
      port: Number(process.env.PORT),
    },
    services: {
      telegramServiceAddress: String(process.env.TELEGRAM_SERVICE_ADDRESS),
    },
  };
}
