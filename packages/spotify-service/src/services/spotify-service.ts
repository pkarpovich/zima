import SpotifyWebApi from "spotify-web-api-node";
import { nanoid } from "nanoid";
import { LoggerService, ConfigService, LocalDbService } from "shared/services";

import { IConfig } from "../config.js";
import { IAuthStore } from "../store.js";

export class SpotifyService {
  private readonly spotifyApi: SpotifyWebApi;

  private readonly localDbService: LocalDbService<IAuthStore>;

  private readonly loggerService: LoggerService;

  private readonly configService: ConfigService<IConfig>;

  private readonly scopes: string[] = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
  ];

  constructor({
    localDbService,
    configService,
    loggerService,
  }: {
    localDbService: LocalDbService<IAuthStore>;
    configService: ConfigService<IConfig>;
    loggerService: LoggerService;
  }) {
    this.spotifyApi = new SpotifyWebApi({
      clientId: configService.get("Spotify.ClientId"),
      clientSecret: configService.get("Spotify.ClientSecret"),
      redirectUri: configService.get("Spotify.RedirectUri"),
    });

    this.localDbService = localDbService;
    this.configService = configService;
    this.loggerService = loggerService;
  }

  async init() {
    const { refreshToken } = this.localDbService.get();

    if (!refreshToken) {
      const authState = nanoid();
      const authURL = this.createAuthorizeURL(authState);
      this.loggerService.log(`Authorization URL: ${authURL}`);
    } else {
      await this.setRefreshToken(refreshToken);
      await this.refreshAccess();
    }
  }

  createAuthorizeURL(state: string) {
    return this.spotifyApi.createAuthorizeURL(this.scopes, state, false);
  }

  async authorizationCodeGrant(code: string) {
    const { body } = await this.spotifyApi.authorizationCodeGrant(code);

    await this.spotifyApi.setAccessToken(body.access_token);
    await this.spotifyApi.setRefreshToken(body.refresh_token);

    await this.localDbService.set({ refreshToken: body.refresh_token });
  }

  setAccessToken(token: string) {
    return this.spotifyApi.setAccessToken(token);
  }

  setRefreshToken(token: string) {
    return this.spotifyApi.setRefreshToken(token);
  }

  async refreshAccess() {
    const { body } = await this.spotifyApi.refreshAccessToken();

    await this.spotifyApi.setAccessToken(body.access_token);
  }

  async getDevices() {
    const {
      body: { devices },
    } = await this.spotifyApi.getMyDevices();

    return devices;
  }

  async resume(deviceId: string): Promise<void> {
    await this.spotifyApi.play({
      device_id: deviceId,
    });
  }

  async play(deviceId: string, contextUri: string): Promise<void> {
    await this.spotifyApi.play({
      context_uri: contextUri,
      device_id: deviceId,
    });
  }

  async pause(deviceId: string): Promise<void> {
    await this.spotifyApi.pause({ device_id: deviceId });
  }

  async nextTrack(deviceId: string): Promise<void> {
    await this.spotifyApi.skipToNext({
      device_id: deviceId,
    });
  }

  async prevTrack(deviceId: string): Promise<void> {
    await this.spotifyApi.skipToPrevious({
      device_id: deviceId,
    });
  }

  async seekTrack(timeMs: number, deviceId: string): Promise<void> {
    await this.spotifyApi.seek(timeMs, { device_id: deviceId });
  }

  async setShuffle(deviceId: string, shuffle: boolean): Promise<void> {
    await this.spotifyApi.setShuffle(shuffle, { device_id: deviceId });
  }

  async changePlaybackDevice(deviceId: string): Promise<void> {
    await this.spotifyApi.transferMyPlayback([deviceId], { play: true });
  }
}
