import { HttpClientService } from "./http-client.service.js";
import { ConfigService } from "./config.service.js";
import { LoggerService } from "./logger.service.js";

export type DiscoveryConfig = {
    name: string;
    address: string;
    actions: string[];
    registryAddress: string;
};

export class DiscoveryClientService {
    constructor(
        private readonly httpClientService: HttpClientService,
        private readonly loggerService: LoggerService,
        private readonly configService: ConfigService<unknown>
    ) {}

    async registerModule() {
        const name = this.configService.get<string>("discovery.name");
        const address = this.configService.get<string>("discovery.address");
        const actions = this.configService.get<string[]>("discovery.actions");
        const registryAddress = this.configService.get<string>("discovery.registryAddress");

        try {
            this.loggerService.info(`Registering module ${name} at ${registryAddress}`);
            await this.httpClientService.post(registryAddress, {
                name,
                address,
                actions,
            });
            this.loggerService.success(`Module ${name} registered successfully`);
        } catch (error) {
            this.loggerService.error(`Failed to register module ${name}`);
            throw error;
        }
    }
}
