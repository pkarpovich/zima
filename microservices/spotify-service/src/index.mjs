import express from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "node:path";
import {
  ConfigService,
  BrokerService,
  LoggerService,
} from "shared/src/services.ts";

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

const configService = new ConfigService({ config: Config() });
const loggerService = new LoggerService({});
const spotifyService = new SpotifyService({
  authStoreService,
  configService,
  loggerService,
});
const brokerService = new BrokerService({ configService, loggerService });

const defaultDeviceType = "TV";

const app = express();
app.get("/callback", async (req, resp) => {
  await spotifyService.authorizationCodeGrant(req.query.code);

  resp.json({ ok: true });
});
app.listen(3000, () => loggerService.log("Listen on port 3000"));

await spotifyService.init();

const serviceQueueName = configService.get("Rabbit.SpotifyQueueName");

const runFunctionWithRetry = async (func) => {
  try {
    await func();
  } catch {
    await spotifyService.refreshAccess();
    await func();
  }
};

const handleQueueMessage = (_, channel) => async (msg) => {
  const {
    name,
    props,
    args: { deviceType } = { deviceType: null },
  } = JSON.parse(msg.content.toString());
  let ansibleOutput = {};

  await runFunctionWithRetry(async () => {
    const devices = await spotifyService.getDevices();
    const targetDevice = deviceType
      ? devices.find((d) => d.type === deviceType)
      : devices.find((d) => d.is_active) ||
        devices.find((d) => d.type === defaultDeviceType);

    switch (name) {
      case ActionTypes.Spotify.Resume: {
        await spotifyService.resume(targetDevice.id);
        break;
      }
      case ActionTypes.Spotify.Pause: {
        await spotifyService.pause(targetDevice.id);
        break;
      }
      case ActionTypes.Spotify.NextTrack: {
        await spotifyService.nextTrack(targetDevice.id);
        break;
      }
      case ActionTypes.Spotify.PrevTrack: {
        await spotifyService.prevTrack(targetDevice.id);
        break;
      }
      case ActionTypes.Spotify.RestartTack: {
        await spotifyService.seekTrack(0, targetDevice.id);
        break;
      }
      case ActionTypes.Spotify.PlayPlaylist: {
        await spotifyService.play(targetDevice.id, props[0].value);
        break;
      }
      case ActionTypes.Spotify.EnableShuffle: {
        await spotifyService.setShuffle(targetDevice.id, true);
        break;
      }
      case ActionTypes.Spotify.DisableShuffle: {
        await spotifyService.setShuffle(targetDevice.id, false);
        break;
      }
      case ActionTypes.Spotify.ChangePlayback: {
        await spotifyService.changePlaybackDevice(targetDevice.id);
      }
    }
  });

  const serviceResp = JSON.stringify(ansibleOutput);

  await channel.sendToQueue(msg.properties.replyTo, Buffer.from(serviceResp), {
    correlationId: msg.properties.correlationId,
  });
};

await brokerService.createConnection();
await brokerService.subscribeToChannel(serviceQueueName, handleQueueMessage);
