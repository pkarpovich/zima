import { ActionTypes } from "shared/constants.mjs";

import { BaseQueryForm } from "./base-query-form.mjs";
import { Action } from "./action.mjs";

export class SpotifyQueryForm extends BaseQueryForm {
  #rabbitService = null;

  #configService = null;

  constructor({ rabbitService, configService }) {
    super({
      name: "Spotify Form",
      globalKeywords: ["spotify"],
      actions: [
        new Action({
          actionType: ActionTypes.Spotify.Resume,
          keywords: ["resume track"],
        }),
        new Action({
          actionType: ActionTypes.Spotify.Pause,
          keywords: ["pause track", "stop track"],
        }),
        new Action({
          actionType: ActionTypes.Spotify.NextTrack,
          keywords: ["next track"],
        }),
        new Action({
          actionType: ActionTypes.Spotify.PrevTrack,
          keywords: ["prev track"],
        }),
        new Action({
          actionType: ActionTypes.Spotify.RestartTack,
          keywords: ["restart current track"],
        }),
        new Action({
          actionType: ActionTypes.Spotify.PlayPlaylist,
          keywords: ["play playlist"],
        }),
        new Action({
          actionType: ActionTypes.Spotify.EnableShuffle,
          keywords: ["enable shuffle"],
        }),
        new Action({
          actionType: ActionTypes.Spotify.DisableShuffle,
          keywords: ["disable shuffle"],
        }),
      ],
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const action of this.actions) {
      action.handler = this.sendMessage(action.actionType);
    }

    this.#rabbitService = rabbitService;
    this.#configService = configService;
  }

  sendMessage(name) {
    return async (action, tokens, text) => {
      const queueName = this.#configService.get("Rabbit.SpotifyQueueName");
      const tokenParams = text
        .trim()
        .split(" ")
        .filter((t) => {
          console.log(t, action.keywords);
          return !action.keywords.some((k) => k.includes(t));
        })
        .filter((t) => !this.globalKeywords.includes(t));

      await this.#rabbitService.createConnection();
      await this.#rabbitService.sendToChannelWithResponse(
        queueName,
        JSON.stringify({ name, props: tokenParams })
      );
      await this.#rabbitService.closeConnection();

      return {
        status: "DONE",
      };
    };
  }
}
