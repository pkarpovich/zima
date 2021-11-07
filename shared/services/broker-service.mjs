import rabbit from "amqplib";
import { nanoid } from "nanoid";

export class BrokerService {
  #configService = null;

  #connection = null;

  constructor({ configService }) {
    this.#configService = configService;
  }

  async createConnection() {
    const url = this.#configService.get("Rabbit.Url");
    this.#connection = await rabbit.connect(url);

    return this.#connection;
  }

  async closeConnection() {
    await this.#connection.close();
    this.#connection = null;

    return null;
  }

  async sendToChannelWithResponse(queueName, message) {
    const channel = await this.#connection.createChannel();

    return new Promise(async (resolve) => {
      const q = await channel.assertQueue("", { exclusive: true });
      const correlationId = nanoid();

      await channel.consume(q.queue, (msg) => {
        if (msg.properties.correlationId === correlationId) {
          resolve(JSON.parse(msg.content.toString()));
        }
      });

      await channel.sendToQueue(queueName, Buffer.from(message), {
        replyTo: q.queue,
        correlationId,
      });
    });
  }

  async subscribeToChannel(queueName, cb) {
    const channel = await this.#connection.createChannel();
    const q = await channel.assertQueue(queueName);

    await channel.consume(queueName, cb(q, channel), { noAck: true });
  }
}
