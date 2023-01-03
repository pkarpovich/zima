export interface IConfig {
  Rabbit: {
    Url: string;
    SmartDevicesQueueName: string;
  };
}

export function Config(): IConfig {
  return {
    Rabbit: {
      Url: String(process.env.AMQP_SERVER_URL),
      SmartDevicesQueueName: String(process.env.AMQP_SMART_DEVICES_QUEUE_NAME),
    },
  };
}
