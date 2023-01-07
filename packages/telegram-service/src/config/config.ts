export interface ITelegramAuthConfig {
  PhoneNumber: string;
  Password: string;
  PhoneCode?: string;
}

export interface ITelegramConfig {
  ApiId: number;
  ApiHash: string;
  SessionString: string;
  Auth: ITelegramAuthConfig;
}

export type IConfig = {
  Telegram: ITelegramConfig;
};

export const Config = (): IConfig => ({
  Telegram: {
    ApiId: Number(process.env.TELEGRAM_API_ID),
    ApiHash: String(process.env.TELEGRAM_API_HASH),
    SessionString: process.env.TELEGRAM_SESSION_STRING || "",
    Auth: {
      PhoneNumber: String(process.env.TELEGRAM_AUTH_PHONE_NUMBER),
      Password: process.env.TELERAM_AUTH_PASSWORD || "",
      PhoneCode: String(process.env.TELEGRAM_AUTH_PHONE_CODE),
    },
  },
});
