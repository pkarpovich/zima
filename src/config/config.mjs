import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "production" ? "prod.env" : "local.env"
  ),
});

export const Config = {
  Rabbit: {
    Url: process.env.AMQP_SERVER_URL,
    FormsQueueName: process.env.AMQP_FORMS_QUEUE_NAME,
  },

  General: {
    Port: process.env.PORT,
  },
};
