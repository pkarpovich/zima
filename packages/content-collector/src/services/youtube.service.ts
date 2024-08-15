import { google } from "googleapis";

import { ConfigService } from "shared/services";

export class YoutubeService {
    private readonly youtube = google.youtube("v3");

    constructor(private readonly configService: ConfigService<unknown>) {}

    search(query: string) {
        return this.youtube.search.list({
            key: this.configService.get("youtube.apiKey"),
            part: ["snippet"],
            q: query,
            type: ["video"],
            maxResults: 1,
        });
    }
}
