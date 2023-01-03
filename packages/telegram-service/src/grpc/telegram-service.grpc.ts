import BigInteger from "big-integer";
import {
  CallResponse,
  DeepPartial,
  TelegramServiceImplementation,
  TelegramServiceDefinition,
  CallRequest,
} from "./__generated__/services/v1/telegram_service.js";
import { TelegramService } from "../services/telegram-service.js";

export class TelegramServiceGrpc implements TelegramServiceImplementation {
  constructor(private readonly telegramService: TelegramService) {}

  async call(request: CallRequest): Promise<DeepPartial<CallResponse>> {
    await this.telegramService.sendMessage(
      !Number.isInteger(+request.chatId)
        ? request.chatId
        : BigInteger(request.chatId),
      {
        message: request.text,
        silent: request.isSilent,
      }
    );

    return {
      status: "OK",
    };
  }
}

export { TelegramServiceDefinition };
