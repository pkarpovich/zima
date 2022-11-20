export const Config = () => ({
  Rabbit: {
    Url: process.env.AMQP_SERVER_URL,
    SmartDevicesQueueName: process.env.AMQP_SMART_DEVICES_QUEUE_NAME,
  },
});
