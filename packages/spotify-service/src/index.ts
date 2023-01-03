import * as fs from "node:fs/promises";
import {
  ConfigService,
  BrokerService,
  LoggerService,
  LocalDbService,
  FilesService,
  HttpService,
  Channel,
  ConsumeMessage,
} from "shared/src/services.js";
import { ActionTypes } from "shared/src/constants.js";
import { runFunctionWithRetry } from "shared/src/utils.js";

import { Config } from "./config.js";
import { IAuthStore } from "./store.js";
import { SpotifyService } from "./services/spotify-service.js";
import { initApiController } from "./controllers/api.controller";
import { SpotifyController } from "./controllers/spotify.controller";

const DEFAULT_STORE_VALUE: IAuthStore = { refreshToken: null };

const filesService = new FilesService(fs);
const configService = new ConfigService({ config: Config() });
const localDbService = new LocalDbService<IAuthStore>(
  DEFAULT_STORE_VALUE,
  configService,
  filesService
);
const loggerService = new LoggerService();
const brokerService = new BrokerService({ configService, loggerService });
const spotifyService = new SpotifyService({
  localDbService,
  configService,
  loggerService,
});
await spotifyService.init();

const spotifyController = new SpotifyController(spotifyService, loggerService);
const apiRouter = initApiController(spotifyController);
const httpService = new HttpService(loggerService, configService, apiRouter);
httpService.start();

const defaultDeviceType = "TV";

const serviceQueueName = configService.get<string>("Rabbit.SpotifyQueueName");

async function handleAction(
  deviceType: string,
  actionType: string,
  props: { value: string }[]
) {
  const devices = await spotifyService.getDevices();
  const targetDevice = deviceType
    ? devices.find((d) => d.type === deviceType)
    : devices.find((d) => d.is_active) ||
      devices.find((d) => d.type === defaultDeviceType);

  if (!targetDevice || !targetDevice.id) {
    throw new Error("No active device found");
  }

  switch (actionType) {
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
      break;
    }
    default: {
      throw new Error(`Unknown action type: ${actionType}`);
    }
  }
}

function handleQueueMessage(_: unknown, channel: Channel) {
  return async (msg: ConsumeMessage) => {
    const {
      name,
      props,
      args: { deviceType } = { deviceType: null },
    } = JSON.parse(msg.content.toString());

    await runFunctionWithRetry(
      async () => handleAction(deviceType, name, props),
      spotifyService.refreshAccess
    );

    const serviceResp = JSON.stringify({});
    channel.sendToQueue(msg.properties.replyTo, Buffer.from(serviceResp), {
      correlationId: msg.properties.correlationId,
    });
  };
}

await brokerService.createConnection();
await brokerService.subscribeToChannel(serviceQueueName, handleQueueMessage);
