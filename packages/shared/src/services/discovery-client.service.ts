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
        private readonly configService: ConfigService<unknown>,
    ) {}

    async registerModule() {
        const name = this.configService.get<string>("discovery.name");
        const address = this.configService.get<string>("discovery.address");
        const actions = this.configService.get<string[]>("discovery.actions");
        const registryAddress = this.configService.get<string>("discovery.registryAddress");
        const actionUrl = `${registryAddress}/discovery/register`;

        try {
            this.loggerService.info(`Registering module ${name} at ${registryAddress}`);
            await this.httpClientService.post(actionUrl, {
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

    async invokeAction<T, P>(action: string, args: T): Promise<P> {
        const registryAddress = this.configService.get<string>("discovery.registryAddress");
        const actionUrl = `${registryAddress}/discovery/invoke`;

        try {
            this.loggerService.info(`Invoking action ${action} at ${registryAddress}`);
            const { data } = await this.httpClientService.post<P>(actionUrl, {
                name: action,
                args,
            });
            this.loggerService.success(`Action ${action} invoked successfully`);

            return data;
        } catch (error) {
            this.loggerService.error(`Failed to invoke action ${action}`);
            throw error;
        }
    }
}
