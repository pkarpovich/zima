import SpotifyWebApi from "spotify-web-api-node";
import { nanoid } from "nanoid";

export class SpotifyService {
  #spotifyApi = null;

  #authStoreService = null;

  #configService = null;

  #scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
  ];

  constructor({ authStoreService, configService }) {
    const spotifyApi = new SpotifyWebApi({
      clientId: configService.get("Spotify.ClientId"),
      clientSecret: configService.get("Spotify.ClientSecret"),
      redirectUri: configService.get("Spotify.RedirectUri"),
    });

    this.#spotifyApi = spotifyApi;
    this.#authStoreService = authStoreService;
    this.#configService = configService;
  }

  async init() {
    const { refreshToken } = this.#authStoreService.get();

    if (!refreshToken) {
      const authState = nanoid();
      const authURL = await this.createAuthorizeURL(authState);
      console.log(`Authorization URL: ${authURL}`);
    } else {
      await this.setRefreshToken(refreshToken);
      await this.refreshAccess();
    }
  }

  createAuthorizeURL(state) {
    return this.#spotifyApi.createAuthorizeURL(this.#scopes, state, false);
  }

  async authorizationCodeGrant(code) {
    const { body } = await this.#spotifyApi.authorizationCodeGrant(code);

    await this.#spotifyApi.setAccessToken(body.access_token);
    await this.#spotifyApi.setRefreshToken(body.refresh_token);

    this.#authStoreService.set({ refreshToken: body.refresh_token });
  }

  setAccessToken(token) {
    return this.#spotifyApi.setAccessToken(token);
  }

  setRefreshToken(token) {
    return this.#spotifyApi.setRefreshToken(token);
  }

  async refreshAccess() {
    const { body } = await this.#spotifyApi.refreshAccessToken();

    await this.#spotifyApi.setAccessToken(body.access_token);
  }

  async getDevices() {
    const {
      body: { devices },
    } = await this.#spotifyApi.getMyDevices();

    return devices;
  }

  async resume(deviceId) {
    return this.#spotifyApi.play({
      device_id: deviceId,
    });
  }

  async play(deviceId, contextUri) {
    return this.#spotifyApi.play({
      context_uri: contextUri,
      device_id: deviceId,
    });
  }

  async pause(deviceId) {
    return this.#spotifyApi.pause({ device_id: deviceId });
  }

  async nextTrack(deviceId) {
    return this.#spotifyApi.skipToNext({
      device_id: deviceId,
    });
  }

  async prevTrack(deviceId) {
    return this.#spotifyApi.skipToPrevious({
      device_id: deviceId,
    });
  }

  async seekTrack(timeMs, deviceId) {
    return this.#spotifyApi.seek(timeMs, { device_id: deviceId });
  }

  async setShuffle(deviceId, shuffle) {
    return this.#spotifyApi.setShuffle(shuffle, { device_id: deviceId });
  }
}
