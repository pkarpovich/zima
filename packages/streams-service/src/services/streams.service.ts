import { ConfigService, DiscoveryClientService, HttpClientService, LoggerService } from "shared/services";
import { Config } from "../config.js";
import { executeWithRetry } from "../utils/execute-with-retry.js";

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
    CurrentApp = "app",
}

enum Providers {
    General = "general",
    Youtube = "youtube",
    Unrecognized = "unrecognized",
}

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractUrl(input: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex);

    return urls ? urls[0] : "";
}

export class StreamsService {
    constructor(
        private readonly configService: ConfigService<Config>,
        private readonly loggerService: LoggerService,
        private readonly discoveryClientService: DiscoveryClientService,
        private readonly httpClientService: HttpClientService,
    ) {}

    async openUrl(input: string) {
        const url = extractUrl(input);
        this.loggerService.info(`Opening url: ${url}`);

        await this.turnOnAppleTv();

        const [deeplink, provider] = this.getDeeplinkByURL(url);
        this.loggerService.info(`Opening deeplink: ${deeplink}`);
        await this.openDeeplink(deeplink, provider);

        this.loggerService.info("Url opened successfully");
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

        isAppleTvOn = await executeWithRetry(this.checkPowerStatus.bind(this), true);
        if (!isAppleTvOn) {
            throw new Error("Failed to turn on Apple TV");
        }
    }

    private getDeeplinkByURL(link: string): [string, Providers] {
        const url = new URL(link);

        if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
            const videoId = url.searchParams.get("v");
            return [`youtube://watch/${videoId}`, Providers.Youtube];
        } else if (url.hostname === "youtu.be") {
            const videoId = url.pathname.split("/")[1];
            return [`youtube://watch/${videoId}`, Providers.Youtube];
        } else {
            const liveStreamForwarderUrl = this.configService.get<string>("liveStreamForwarder.url");
            const atvUrl = this.configService.get<string>("liveStreamForwarder.atvUrl");

            const streamUrl = `${liveStreamForwarderUrl}/live-stream/playlist?url=${encodeURI(link)}`;
            const deeplinkUrl = `${atvUrl}/open?target=vlc-x-callback://x-callback-url/stream?url=${encodeURIComponent(streamUrl)}`;
            return [deeplinkUrl, Providers.General];
        }

        return [link, Providers.Unrecognized];
    }

    private async launchApp(appId: string) {
        this.loggerService.info(`Launching app: ${appId}`);
        await this.discoveryClientService.invokeAction<AppleTvExecuteArgs, AppleTvExecuteResponse>(AppleTvExecuteType, {
            command: `${AppleTvCommands.LaunchApp}=${appId}`,
        });
    }

    private async openDeeplink(deeplink: string, provider: Providers) {
        switch (provider) {
            case Providers.Youtube: {
                await this.launchApp(deeplink);
                break;
            }
            case Providers.General: {
                await this.launchApp("com.celerity.DeepLink");
                await wait(8000);

                await this.httpClientService.get(deeplink);
                break;
            }
            case Providers.Unrecognized: {
                this.loggerService.error(`Unrecognized provider for deeplink: ${deeplink}`);
                break;
            }
        }
    }
}
