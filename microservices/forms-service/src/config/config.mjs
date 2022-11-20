export const Config = () => ({
  Database: {
    ConnectionString: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`,
  },
  Rabbit: {
    Url: process.env.AMQP_SERVER_URL,
    MeetingsQueueName: process.env.AMQP_MEETINGS_QUEUE_NAME,
    AnsibleQueueName: process.env.AMQP_ANSIBLE_QUEUE_NAME,
    SmartDevicesQueueName: process.env.AMQP_SMART_DEVICES_QUEUE_NAME,
    SpotifyQueueName: process.env.AMQP_SPOTIFY_QUEUE_NAME,
    FormsQueueName: process.env.AMQP_FORMS_QUEUE_NAME,
  },
});
