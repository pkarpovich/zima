export type IConfig = {
  Rabbit: {
    Url: string;
    SpotifyQueueName: string;
  };
  Spotify: {
    ClientId: string;
    ClientSecret: string;
    RedirectUri: string;
  };
  dbPath: string;
  http: {
    port: number;
  };
};

export function Config(): IConfig {
  return {
    Rabbit: {
      Url: String(process.env.AMQP_SERVER_URL),
      SpotifyQueueName: String(process.env.AMQP_SPOTIFY_QUEUE_NAME),
    },
    Spotify: {
      ClientId: String(process.env.SPOTIFY_CLIENT_ID),
      ClientSecret: String(process.env.SPOTIFY_CLIENT_SECRET),
      RedirectUri: String(process.env.SPOTIFY_REDIRECT_URI),
    },
    dbPath: String(process.env.AUTH_DB_PATH),
    http: {
      port: Number(process.env.HTTP_PORT),
    },
  };
}
