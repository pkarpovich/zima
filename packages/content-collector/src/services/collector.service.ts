import { DiscoveryClientService, LoggerService } from "shared/services";
import { ContentRepository, ContentWithPlayback } from "../repositories/content.repository.js";
import { generateUniqId } from "shared/utils";

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
        private readonly contentRepository: ContentRepository,
        private readonly loggerService: LoggerService,
    ) {}

    async getAll(): Promise<ContentWithPlayback[]> {
        return this.contentRepository.getContentWithPlayback();
    }

    async create() {
        const currentPlaying = await this.getCurrentPlaying();
        const currentApp = await this.getCurrentApp();

        if (!currentPlaying || !currentApp) {
            return;
        }

        const existingContent = this.contentRepository.findByTitleAndArtist(
            currentPlaying.title,
            currentPlaying.artist,
        );

        const contentId = existingContent ? existingContent.id : generateUniqId();
        this.contentRepository.createOrReplaceContent({
            id: contentId,
            title: currentPlaying.title,
            mediaType: currentPlaying.mediaType,
            artist: currentPlaying.artist,
            album: currentPlaying.album,
            application: currentApp,
            createdAt: existingContent ? existingContent.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        this.contentRepository.createPlayback({
            id: generateUniqId(),
            contentId: contentId,
            position: currentPlaying.position,
            updatedAt: new Date().toISOString(),
        });
    }

    async getCurrentApp(): Promise<string | null> {
        const { response } = await this.discoveryClientService.invokeAction<AppleTvExecuteArgs, AppleTvExecuteResponse>(
            AppleTvExecuteType,
            {
                command: "app",
            },
        );

        if (!response) {
            this.loggerService.error("No response from device");
            return null;
        }

        return response.replace("App: ", "").trim();
    }

    async getCurrentPlaying(): Promise<PlayingInfo | null> {
        const { response } = await this.discoveryClientService.invokeAction<AppleTvExecuteArgs, AppleTvExecuteResponse>(
            AppleTvExecuteType,
            {
                command: "playing",
            },
        );

        if (!response) {
            this.loggerService.error("No response from device");
            return null;
        }

        if (response.includes(IdleState)) {
            this.loggerService.info("Device is idle");
            return null;
        }

        return this.parsePlayingInfo(response);
    }

    private parsePlayingInfo(response: string): PlayingInfo {
        const rawInfo = response.split("\n").map((x) => x.trim());
        const infoMap: { [key: string]: string } = rawInfo.reduce(
            (acc, line) => {
                const separatorIndex = line.indexOf(": ");
                if (separatorIndex !== -1) {
                    const key = line.substring(0, separatorIndex).trim();
                    acc[key] = line.substring(separatorIndex + 2).trim();
                }
                return acc;
            },
            {} as { [key: string]: string },
        );

        return {
            mediaType: infoMap["Media type"] || "Unknown",
            deviceState: infoMap["Device state"] || "Unknown",
            title: infoMap["Title"] || "Unknown",
            artist: infoMap["Artist"] || "Unknown",
            album: infoMap["Album"] || "Unknown",
            position: infoMap["Position"] || "Unknown",
            repeat: infoMap["Repeat"] || "Unknown",
            shuffle: infoMap["Shuffle"] || "Unknown",
        };
    }
}
