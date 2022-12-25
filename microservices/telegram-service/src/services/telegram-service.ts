import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { SendMessageParams } from "telegram/client/messages";
import { BigInteger } from "big-integer";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ConfigService, LoggerService } from "shared/services.mjs";
import { input } from "../utils/input.js";

import SendMessage = Api.messages.SendMessage;
import GetFullChat = Api.messages.GetFullChat;

export type ISendMessageParams = SendMessageParams;

const CONNECION_RETRIES = 5;

export class TelegramService {
  private client: TelegramClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService
  ) {
    const { ApiId, ApiHash, SessionString } =
      this.configService.get("Telegram");

    const stringSession = new StringSession(SessionString);

    this.client = new TelegramClient(stringSession, ApiId, ApiHash, {
      connectionRetries: CONNECION_RETRIES,
    });
  }

  async start(): Promise<void> {
    const { SessionString, Auth } = this.configService.get("Telegram");

    await this.client.start({
      phoneNumber: () => Auth.PhoneNumber,
      password: () => Auth.Password,
      phoneCode: () => input("Enter code: "),
      onError: (err) => this.loggerService.error(err),
    });

    if (!SessionString) {
      this.loggerService.info(`Session String: ${this.client.session.save()}`);
    }
  }

  async sendMessage(
    chatId: BigInteger | string,
    msg: ISendMessageParams
  ): Promise<void> {
    const text = `🤖 ${msg.message}`;

    if (typeof chatId === "object") {
      await this.client.invoke(new GetFullChat({ chatId }));
    }

    await this.client.invoke(
      new SendMessage({
        silent: msg.silent,
        message: text,
        peer: chatId,
      })
    );

    this.loggerService.success(`Message with text '${text}' sent to ${chatId}`);
  }
}
