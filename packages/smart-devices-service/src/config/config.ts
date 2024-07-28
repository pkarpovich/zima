import { DiscoveryConfig } from "shared/services";
import { ActionTypes } from "../constants/action-types.js";

export interface IConfig {
    http: {
        port: number;
    };
    discovery: DiscoveryConfig;
}

export function Config(): IConfig {
    return {
        http: {
            port: Number(process.env.PORT) || 3200,
        },
        discovery: {
            name: String(process.env.DISCOVERY_NAME),
            address: String(process.env.DISCOVERY_ADDRESS),
            actions: Object.values(ActionTypes),
            registryAddress: String(process.env.DISCOVERY_SERVER_ADDRESS),
        },
    };
}
