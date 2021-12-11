import express from "express";
import { Low, JSONFile } from "lowdb";
import { join } from "path";
import {
  ConfigService,
  BrokerService,
  LoggerService,
} from "shared/services.mjs";

import { Config } from "./config.mjs";
import { SpotifyService } from "./spotify-service.mjs";
import { ActionTypes } from "shared/constants/action-types.mjs";
import { AuthStoreService } from "./auth-store-service.mjs";

const __dirname = process.cwd();
const authFile = join(__dirname, "auth.json");
const adapter = new JSONFile(authFile);
const db = new Low(adapter);

const authStoreService = new AuthStoreService(db);
await authStoreService.init();

const configService = new ConfigService({ config: Config });
const spotifyService = new SpotifyService({ authStoreService, configService });
const loggerService = new LoggerService({});
const brokerService = new BrokerService({ configService, loggerService });

const app = express();
app.get("/callback", async (req, resp) => {
  await spotifyService.authorizationCodeGrant(req.query.code);

  resp.json({ ok: true });
});
app.listen(3000, () => console.log("Listen on port 3000"));

await spotifyService.init();

const serviceQueueName = configService.get("Rabbit.SpotifyQueueName");

const runFunctionWithRetry = async (func) => {
  try {
    await func()
  } catch {
    await spotifyService.refreshAccess();
    await func()
  }
}

const handleQueueMessage = (_, channel) => async (msg) => {
  const { name, props } = JSON.parse(msg.content.toString());
  let ansibleOutput = {};

  await runFunctionWithRetry(async () => {
    const devices = await spotifyService.getDevices();
    const tv = devices.find((d) => d.type === "TV");

    switch (name) {
      case ActionTypes.Spotify.Resume: {
        await spotifyService.resume(tv.id);
        break;
      }
      case ActionTypes.Spotify.Pause: {
        await spotifyService.pause(tv.id);
        break;
      }
      case ActionTypes.Spotify.NextTrack: {
        await spotifyService.nextTrack(tv.id);
        break;
      }
      case ActionTypes.Spotify.PrevTrack: {
        await spotifyService.prevTrack(tv.id);
        break;
      }
      case ActionTypes.Spotify.RestartTack: {
        await spotifyService.seekTrack(0, tv.id);
        break;
      }
      case ActionTypes.Spotify.PlayPlaylist: {
        await spotifyService.play(tv.id, props[0]);
        break;
      }
      case ActionTypes.Spotify.EnableShuffle: {
        await spotifyService.setShuffle(tv.id, true);
        break;
      }
      case ActionTypes.Spotify.DisableShuffle: {
        await spotifyService.setShuffle(tv.id, false);
        break;
      }
    }
  })

  const serviceResp = JSON.stringify(ansibleOutput);

  await channel.sendToQueue(msg.properties.replyTo, Buffer.from(serviceResp), {
    correlationId: msg.properties.correlationId,
  });
};

await brokerService.createConnection();
await brokerService.subscribeToChannel(serviceQueueName, handleQueueMessage);
