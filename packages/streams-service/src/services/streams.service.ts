import type { ConfigService, DiscoveryClientService, LoggerService } from "shared/services";
import { Config } from "../config.js";

const AppleTvExecuteType = "apple-tv-execute";

type AppleTvExecuteArgs = {
    command: string;
};

type AppleTvExecuteResponse = {
    response: string;
};

enum AppleTvPowerState {
    On = "PowerState.On",
    Off = "PowerState.Off",
}

enum AppleTvCommands {
    PowerState = "power_state",
    TurnOn = "turn_on",
    LaunchApp = "launch_app",
}

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class StreamsService {
    constructor(
        private readonly configService: ConfigService<Config>,
        private readonly loggerService: LoggerService,
        private readonly discoveryClientService: DiscoveryClientService,
    ) {}

    async openUrl(url: string) {
        this.loggerService.info(`Opening url: ${url}`);

        await this.turnOnAppleTv();

        const deeplink = this.getDeeplinkByURL(url);
        this.loggerService.info(`Opening deeplink: ${deeplink}`);
        await this.launchApp(deeplink);

        this.loggerService.info("Apple TV is on, url opened successfully");
    }

    private async checkPowerStatus(): Promise<boolean> {
        const { response } = await this.discoveryClientService.invokeAction<AppleTvExecuteArgs, AppleTvExecuteResponse>(
            AppleTvExecuteType,
            {
                command: AppleTvCommands.PowerState,
            },
        );

        return response === AppleTvPowerState.On;
    }

    private async turnOnAppleTv() {
        let isAppleTvOn = await this.checkPowerStatus();
        if (isAppleTvOn) {
            this.loggerService.info("Apple TV is already on");
            return;
        }

        this.loggerService.info("Turning on Apple TV");
        await this.discoveryClientService.invokeAction<AppleTvExecuteArgs, AppleTvExecuteResponse>(AppleTvExecuteType, {
            command: AppleTvCommands.TurnOn,
        });
        await wait(5000);

        isAppleTvOn = await this.checkPowerStatus();
        if (!isAppleTvOn) {
            throw new Error("Failed to turn on Apple TV");
        }
    }

    private getDeeplinkByURL(link: string): string {
        const url = new URL(link);
        if (url.hostname === "www.youtube.com") {
            const videoId = url.searchParams.get("v");
            return `youtube://watch/${videoId}`;
        }

        return link;
    }

    private async launchApp(appId: string) {
        this.loggerService.info(`Launching app: ${appId}`);
        await this.discoveryClientService.invokeAction<AppleTvExecuteArgs, AppleTvExecuteResponse>(AppleTvExecuteType, {
            command: `${AppleTvCommands.LaunchApp}=${appId}`,
        });
    }
}
