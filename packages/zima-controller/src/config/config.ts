export interface IConfig {
  Rabbit: {
    Url: string;
    FormsQueueName: string;
  };
  General: {
    Port: number;
  };
}

export function Config(): IConfig {
  return {
    Rabbit: {
      Url: String(process.env.AMQP_SERVER_URL),
      FormsQueueName: String(process.env.AMQP_FORMS_QUEUE_NAME),
    },

    General: {
      Port: Number(process.env.PORT),
    },
  };
}
