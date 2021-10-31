import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "production" ? "prod.env" : "local.env"
  ),
});

export const Config = {
  VPN: {
    FolderFilesPath: process.env.VPN_FILES_PATH,
  },

  Rabbit: {
    Url: process.env.AMQP_SERVER_URL,
    MeetingsQueueName: process.env.AMQP_MEETINGS_QUEUE_NAME,
    AnsibleQueueName: process.env.AMQP_ANSIBLE_QUEUE_NAME,
  },

  General: {
    Port: process.env.PORT,
  },
};
