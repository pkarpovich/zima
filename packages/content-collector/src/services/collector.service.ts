import { DiscoveryClientService, LoggerService } from "shared/services";

const AppleTvExecuteType = "apple-tv-execute";

type AppleTvExecuteArgs = {
    command: string;
};

type AppleTvExecuteResponse = {
    response: string;
};

type PlayingInfo = {
    mediaType: string;
    deviceState: string;
    title: string;
    artist: string;
    album: string;
    position: string;
    repeat: string;
    shuffle: string;
};

const IdleState = "Device state: Idle";

export class CollectorService {
    constructor(
        private readonly discoveryClientService: DiscoveryClientService,
        private readonly loggerService: LoggerService,
    ) {}

    async getAll() {
        await this.getCurrentPlaying();
    }

    create() {}

    async getCurrentPlaying() {
        const { response } = await this.discoveryClientService.invokeAction<AppleTvExecuteArgs, AppleTvExecuteResponse>(
            AppleTvExecuteType,
            {
                command: "playing",
            },
        );

        if (!response) {
            this.loggerService.error("No response from device");
            return;
        }

        if (response.includes(IdleState)) {
            this.loggerService.info("Device is idle");
            return;
        }

        const info = this.parsePlayingInfo(response);
        console.log(info);
    }

    private parsePlayingInfo(response: string): PlayingInfo {
        const rawInfo = response.split("\n").map((x) => x.trim());

        return {
            mediaType: rawInfo[0].split(": ")[1],
            deviceState: rawInfo[1].split(": ")[1],
            title: rawInfo[2].split(": ")[1],
            artist: rawInfo[3].split(": ")[1],
            album: rawInfo[4].split(": ")[1],
            position: rawInfo[5].split(": ")[1],
            repeat: rawInfo[6].split(": ")[1],
            shuffle: rawInfo[7].split(": ")[1],
        };
    }
}
