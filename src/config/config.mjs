export const Config = {
  Rabbit: {
    Url: process.env.AMQP_SERVER_URL,
    FormsQueueName: process.env.AMQP_FORMS_QUEUE_NAME,
  },

  General: {
    Port: process.env.PORT,
  },
};
