import type { DiscoveryConfig, HttpServiceConfig } from "shared/services";

import { ActionTypes } from "./action-types.js";

export type Config = {
    discovery: DiscoveryConfig;
    http: HttpServiceConfig;
    dbPath: string;
    cronTriggerPattern: string;
    allowPopulate: boolean;
    youtube: {
        apiKey: string;
    };
    plex: {
        url: string;
        username: string;
        password: string;
    };
};

export function Config(): Config {
    return {
        discovery: {
            name: String(process.env.DISCOVERY_NAME),
            actions: Object.values(ActionTypes),
            address: String(process.env.DISCOVERY_ADDRESS),
            registryAddress: String(process.env.DISCOVERY_SERVER_ADDRESS),
        },
        http: {
            port: Number(process.env.PORT) || 3500,
        },
        youtube: {
            apiKey: String(process.env.YOUTUBE_API_KEY),
        },
        plex: {
            url: String(process.env.PLEX_URL),
            username: String(process.env.PLEX_USERNAME),
            password: String(process.env.PLEX_PASSWORD),
        },
        dbPath: process.env.DB_PATH || ".db/content.db",
        allowPopulate: process.env.ALLOW_POPULATE === "true",
        cronTriggerPattern: process.env.CRON_TRIGGER_PATTERN || "*/5 * * * *",
    };
}
