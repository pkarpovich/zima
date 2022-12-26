import { Api, TelegramClient } from "telegram";
// eslint-disable-next-line file-extension-in-import-ts/file-extension-in-import-ts
import { StringSession } from "telegram/sessions";
// eslint-disable-next-line file-extension-in-import-ts/file-extension-in-import-ts
import { SendMessageParams } from "telegram/client/messages";
import { BigInteger } from "big-integer";
import { ConfigService, LoggerService } from "shared/src/services";
import { IConfig } from "../config/config.js";
import { input } from "../utils/input.js";

import SendMessage = Api.messages.SendMessage;
import GetFullChat = Api.messages.GetFullChat;

export type ISendMessageParams = SendMessageParams;

const CONNECION_RETRIES = 5;

export class TelegramService {
  private client: TelegramClient;

  constructor(
    private readonly configService: ConfigService<IConfig>,
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
      phoneNumber: () => Promise.resolve(Auth.PhoneNumber),
      password: () => Promise.resolve(Auth.Password),
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
