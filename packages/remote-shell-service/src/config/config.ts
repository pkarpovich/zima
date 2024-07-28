import * as process from "node:process";
import { DiscoveryConfig } from "shared/services";

import { ActionTypes } from "../constants/action-types.js";

export interface IConfig {
    http: {
        port: number;
    };
    SSH: {
        Host: string;
        Username: string;
    };
    discovery: DiscoveryConfig;
}

export function Config(): IConfig {
    return {
        http: {
            port: Number(process.env.PORT) || 3300,
        },

        discovery: {
            name: String(process.env.DISCOVERY_NAME),
            address: String(process.env.DISCOVERY_ADDRESS),
            actions: Object.values(ActionTypes),
            registryAddress: String(process.env.DISCOVERY_SERVER_ADDRESS),
        },

        SSH: {
            Host: String(process.env.SSH_HOST),
            Username: String(process.env.SSH_USER),
        },
    };
}
