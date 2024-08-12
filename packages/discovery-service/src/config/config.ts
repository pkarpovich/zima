type HttpConfig = {
    port: number;
};

type Config = {
    http: HttpConfig;
    cronTriggerPattern: string;
};

export const Config: Config = {
    http: {
        port: Number(process.env.PORT) || 3000,
    },
    cronTriggerPattern: process.env.CRON_TRIGGER_PATTERN || "*/5 * * * *",
};
