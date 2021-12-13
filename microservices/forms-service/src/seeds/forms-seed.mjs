import { ActionTypes, TokenTypes } from "shared/constants.mjs";
import { Config } from "../config/config.mjs";

export const FormsSeed = [
  {
    name: "Yeelight devices",
    globalKeywords: ["light"],
    queueName: Config.Rabbit.SmartDevicesQueueName,
    actions: [
      {
        keywords: ["turn on"],
        actionType: ActionTypes.SmartDevices.TurnOnYeelight,
      },
      {
        keywords: ["turn off"],
        actionType: ActionTypes.SmartDevices.TurnOffYeelight,
      },
      {
        keywords: ["set random color"],
        actionType: ActionTypes.SmartDevices.SetYeelightRandomColor,
      },
    ],
  },

  {
    name: "Spotify",
    globalKeywords: ["spotify"],
    queueName: Config.Rabbit.SpotifyQueueName,
    actions: [
      {
        keywords: ["resume track"],
        actionType: ActionTypes.Spotify.Resume,
      },
      {
        keywords: ["pause track", "stop track"],
        actionType: ActionTypes.Spotify.Pause,
      },
      {
        keywords: ["next track"],
        actionType: ActionTypes.Spotify.NextTrack,
      },
      {
        keywords: ["prev track"],
        actionType: ActionTypes.Spotify.PrevTrack,
      },
      {
        keywords: ["restart current track"],
        actionType: ActionTypes.Spotify.RestartTack,
      },
      {
        keywords: ["play playlist"],
        actionType: ActionTypes.Spotify.PlayPlaylist,
        props: [
          {
            name: "playlist",
            type: TokenTypes.RemainingWords,
            clarifyingQuestion: "What playlist I should play",
          },
        ],
      },
      {
        keywords: ["enable shuffle"],
        actionType: ActionTypes.Spotify.EnableShuffle,
      },
      {
        keywords: ["disable shuffle"],
        actionType: ActionTypes.Spotify.DisableShuffle,
      },
    ],
  },

  {
    name: "Meetings",
    globalKeywords: ["meeting"],
    queueName: Config.Rabbit.MeetingsQueueName,
    actions: [{ keywords: ["start"], actionType: ActionTypes.Meetings.Start }],
  },

  {
    name: "VPN Form",
    globalKeywords: ["vpn"],
    queueName: Config.Rabbit.AnsibleQueueName,
    actions: [
      {
        keywords: ["start"],
        actionType: ActionTypes.Ansible.VpnStart,
        props: [
          {
            name: "location",
            type: TokenTypes.RemainingWords,
            clarifyingQuestion: "In which country turn on VPN?",
          },
        ],
      },
      {
        keywords: ["stop"],
        actionType: ActionTypes.Ansible.VpnStop,
      },
      {
        keywords: ["status"],
        actionType: ActionTypes.Ansible.VpnStatus,
      },
    ],
  },
];