import { DiscoveryClientService, LoggerService } from "shared/services";
import { Content, ContentRepository, Metadata } from "../repositories/content.repository.js";
import { generateUniqId } from "shared/utils";
import { YoutubeService } from "./youtube.service.js";
import { PlexService } from "./plex.service.js";

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
        private readonly youtubeService: YoutubeService,
        private readonly plexService: PlexService,
    ) {}

    async getAll(applicationName?: string, includePlayback?: boolean): Promise<Content[]> {
        return this.contentRepository.getContentWithPlayback(applicationName, includePlayback);
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

        if (existingContent?.metadata) {
            return;
        }

        const metadata = await this.populateMetadata(currentPlaying, currentApp);
        if (metadata) {
            metadata.contentId = contentId;
            this.contentRepository.createOrReplaceMetadata(metadata);
        }
    }

    async getCurrentApp(): Promise<string | null> {
        try {
            const { response } = await this.discoveryClientService.invokeAction<
                AppleTvExecuteArgs,
                AppleTvExecuteResponse
            >(AppleTvExecuteType, {
                command: "app",
            });

            if (!response) {
                this.loggerService.error("No response from device");
                return null;
            }

            return response.replace("App: ", "").trim();
        } catch (e: any) {
            this.loggerService.error("Error getting current app", e);
            return null;
        }
    }

    async getCurrentPlaying(): Promise<PlayingInfo | null> {
        try {
            const { response } = await this.discoveryClientService.invokeAction<
                AppleTvExecuteArgs,
                AppleTvExecuteResponse
            >(AppleTvExecuteType, {
                command: "playing",
            });

            if (!response) {
                this.loggerService.error("No response from device");
                return null;
            }

            if (response.includes(IdleState)) {
                this.loggerService.info("Device is idle");
                return null;
            }

            return this.parsePlayingInfo(response);
        } catch (error: any) {
            this.loggerService.error("Error getting playing info", error);
            return null;
        }
    }

    async populate() {
        const content = await this.getAll();

        for (const item of content) {
            if (item.application.toLowerCase().includes("youtube")) {
                const searchQuery = `${item.artist} - ${item.title}`;
                const metadata = await this.populateYoutubeMetadata(searchQuery);
                if (metadata) {
                    metadata.contentId = item.id;
                    this.contentRepository.createOrReplaceMetadata(metadata);
                }
            }

            if (item.application.toLowerCase().includes("plex") || item.application.toLowerCase().includes("infuse")) {
                const metadata = await this.populatePlexMetadata(item.title);
                if (metadata) {
                    metadata.contentId = item.id;
                    this.contentRepository.createOrReplaceMetadata(metadata);
                }
            }
        }
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

    private async populateMetadata(playingInfo: PlayingInfo, currentApp: string): Promise<Metadata | null> {
        if (currentApp.toLowerCase().includes("youtube")) {
            const searchQuery = `${playingInfo.artist} - ${playingInfo.title}`;

            return this.populateYoutubeMetadata(searchQuery);
        }

        if (currentApp.toLowerCase().includes("plex") || currentApp.toLowerCase().includes("infuse")) {
            const searchQuery = `${playingInfo.artist} ${playingInfo.title}`;

            return this.populatePlexMetadata(searchQuery);
        }

        return null;
    }

    private async populateYoutubeMetadata(searchQuery: string): Promise<Metadata | null> {
        const { data: youtubeResult } = await this.youtubeService.search(searchQuery);

        if (!youtubeResult) {
            this.loggerService.error(`No youtube result found for query: ${searchQuery}`);
            return null;
        }

        const video = youtubeResult.items?.[0];
        if (!video) {
            this.loggerService.error(`No youtube video found for query: ${searchQuery}`);
            return null;
        }

        const videoId = video.id?.videoId;
        if (!videoId) {
            this.loggerService.error(`No videoId found for query: ${searchQuery}`);
            return null;
        }

        return {
            id: videoId,
            contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
            posterLink: video.snippet?.thumbnails?.medium?.url || "",
            contentId: "",
            videoId,
        };
    }

    private async populatePlexMetadata(searchQuery: string): Promise<Metadata | null> {
        const query = searchQuery.split(" - ").at(-1);

        if (!query) {
            this.loggerService.error(`No query found for title: ${searchQuery}`);
            return null;
        }

        const result = await this.plexService.search(query);
        if (!result) {
            this.loggerService.error(`No plex result found for query: ${query}`);
            return null;
        }

        return {
            id: result.url.split("/").at(-1)!,
            contentUrl: result.url,
            posterLink: result.thumb,
            contentId: "",
            videoId: result.url,
        };
    }
}
