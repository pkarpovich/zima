import rabbit, { Channel, Connection, Replies } from "amqplib";
import { nanoid } from "nanoid";
import { ConfigService } from "./config-service.js";
import { LoggerService } from "./logger-service.js";
import AssertQueue = Replies.AssertQueue;

export class BrokerService {
  private readonly configService: ConfigService<unknown>;

  private readonly loggerService: LoggerService;

  private connection: Connection | null = null;

  constructor({
    configService,
    loggerService,
  }: {
    configService: ConfigService<unknown>;
    loggerService: LoggerService;
  }) {
    this.configService = configService;
    this.loggerService = loggerService;
  }

  async createConnection() {
    const url = this.configService.get("Rabbit.Url");
    this.connection = await rabbit.connect(url);

    return this.connection;
  }

  async closeConnection() {
    await this.connection?.close();
    this.connection = null;

    return null;
  }

  async sendToChannelWithResponse(queueName: string, message: unknown) {
    if (!this.connection) {
      return null;
    }

    const channel = await this.connection.createChannel();

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const q = await channel.assertQueue("", { exclusive: true });
      const correlationId = nanoid();

      await channel.consume(q.queue, (msg) => {
        if (!msg) {
          reject(new Error("Message is null"));
          return;
        }

        if (msg.properties.correlationId === correlationId) {
          const rawMessage = msg.content.toString();
          this.loggerService.log(
            `Received message from queue ${q.queue} with message ${rawMessage}`
          );
          resolve(JSON.parse(rawMessage));
        }
      });

      this.loggerService.log(
        `Send message to queue ${queueName} with message ${message}`
      );
      channel.sendToQueue(queueName, Buffer.from(message as string), {
        replyTo: q.queue,
        correlationId,
      });
    });
  }

  async subscribeToChannel(
    queueName: string,
    cb: (q: AssertQueue, c: Channel) => (message: unknown) => void
  ): Promise<void> {
    if (!this.connection) {
      return;
    }

    const channel = await this.connection.createChannel();
    const q = await channel.assertQueue(queueName);

    await channel.consume(
      queueName,
      (msg) => {
        if (!msg) {
          cb(q, channel)(msg);
          return;
        }

        const rawMessage = msg.content.toString();
        this.loggerService.log(
          `Received message from queue ${queueName} with message ${rawMessage}`
        );

        cb(q, channel)(msg);
      },
      { noAck: true }
    );
  }
}
