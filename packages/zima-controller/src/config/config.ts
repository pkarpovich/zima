export interface IConfig {
  Rabbit: {
    Url: string;
    FormsQueueName: string;
  };
  http: {
    port: number;
  };
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
  };
}
