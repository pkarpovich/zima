export interface IConfig {
  Database: {
    ConnectionString: string;
  };
  Rabbit: {
    Url: string;
    MeetingsQueueName: string;
    AnsibleQueueName: string;
    SmartDevicesQueueName: string;
    SpotifyQueueName: string;
    FormsQueueName: string;
  };
}

export function Config(): IConfig {
  return {
    Database: {
      ConnectionString: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`,
    },
    Rabbit: {
      Url: String(process.env.AMQP_SERVER_URL),
      MeetingsQueueName: String(process.env.AMQP_MEETINGS_QUEUE_NAME),
      AnsibleQueueName: String(process.env.AMQP_ANSIBLE_QUEUE_NAME),
      SmartDevicesQueueName: String(process.env.AMQP_SMART_DEVICES_QUEUE_NAME),
      SpotifyQueueName: String(process.env.AMQP_SPOTIFY_QUEUE_NAME),
      FormsQueueName: String(process.env.AMQP_FORMS_QUEUE_NAME),
    },
  };
}
