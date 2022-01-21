export const ActionTypes = {
  SmartDevices: {
    SetYeelightRandomColor: "set-yeelight-random-color",
    SetRandomColorInEveryLight: "set-random-color-in-every-light",
    TurnOnYeelight: "turn-on-yeelight",
    TurnOffYeelight: "turn-off-yeelight",
    StartFlowMode: "start-flow-mode",
    StopFlowMode: "stop-flow-mode",
    AppleTvExecute: "apple-tv-execute",
  },

  Ansible: {
    VpnStart: "start-vpn",
    VpnStop: "stop-vpn",
    VpnStatus: "vpn-status",
  },

  Meetings: {
    Start: "start-meeting",
  },

  Spotify: {
    Resume: "spotify-resume-track",
    Pause: "spotify-pause-track",
    NextTrack: "spotify-next-track",
    PrevTrack: "spotify-prev-track",
    PlayPlaylist: "spotify-play-playlist",
    RestartTack: "spotify-restart-tack",
    EnableShuffle: "spotify-enable-shuffle",
    DisableShuffle: "spotify-disable-shuffle",
    ChangePlayback: "spotify-change-playback",
  },

  System: {
    Repeat: "repeat",
  },
};
