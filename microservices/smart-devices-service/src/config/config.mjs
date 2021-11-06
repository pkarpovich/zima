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
    SmartDevicesQueueName: process.env.AMQP_SMART_DEVICES_QUEUE_NAME,
  },
};
