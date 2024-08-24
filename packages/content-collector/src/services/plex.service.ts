import { ConfigService } from "shared/services";
import { MyPlexAccount } from "@ctrl/plex";

export type SearchResult = {
    url: string;
    thumb: string;
    deepLink: string;
};

export class PlexService {
    constructor(private readonly configService: ConfigService<unknown>) {}

    async search(query: string): Promise<SearchResult | null> {
        const account = await new MyPlexAccount(
            this.configService.get<string>("plex.url"),
            this.configService.get<string>("plex.username"),
            this.configService.get<string>("plex.password"),
        ).connect();
        const resources = await account.resources();
        const plex = await resources[0].connect();
        const resp = await plex.search(query);

        const params = new URLSearchParams();
        params.append("X-Plex-Token", plex.token);

        const metadata = resp[0]?.Metadata?.[0];
        const serverInfo = resp[0]?.server;

        if (!metadata || !serverInfo) {
            return null;
        }

        const thumb = `${serverInfo.baseurl}${metadata.thumb}?${params.toString()}`;
        const deepLink = `plex://preplay/?metadataKey=${encodeURIComponent(metadata.key)}&server=${serverInfo.machineIdentifier}`;

        return {
            thumb,
            deepLink,
            url: metadata.guid,
        };
    }
}
