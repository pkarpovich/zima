export const Config = {
  Rabbit: {
    Url: process.env.AMQP_SERVER_URL,
    SpotifyQueueName: process.env.AMQP_SPOTIFY_QUEUE_NAME,
  },
  Spotify: {
    ClientId: process.env.SPOTIFY_CLIENT_ID,
    ClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    RedirectUri: process.env.SPOTIFY_REDIRECT_URI,
  },
};
