type HttpConfig = {
    port: number;
};

type Config = {
    http: HttpConfig;
};

export const Config: Config = {
    http: {
        port: Number(process.env.PORT) || 3000,
    },
};
