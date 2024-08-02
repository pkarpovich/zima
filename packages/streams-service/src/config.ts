import type { DiscoveryConfig, HttpServiceConfig } from "shared/services";

import { ActionTypes } from "./action-types.js";

export type Config = {
    discovery: DiscoveryConfig;
    http: HttpServiceConfig;
    liveStreamForwarder: {
        atvUrl: string;
        url: string;
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
            port: Number(process.env.PORT) || 3400,
        },
        liveStreamForwarder: {
            url: String(process.env.LIVE_STREAM_FORWARDER_URL),
            atvUrl: String(process.env.LIVE_STREAM_FORWARDER_ATV_URL),
        },
    };
}
