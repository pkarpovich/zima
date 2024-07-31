import { exec } from "child_process";
import { ConfigService, LoggerService } from "shared/services";
import { IConfig } from "../config/config.js";

export class AtvService {
    constructor(
        private readonly configService: ConfigService<IConfig>,
        private readonly loggerService: LoggerService,
    ) {}

    async execute(command: string) {
        const host = this.configService.get("SSH.Host");
        const user = this.configService.get("SSH.Username");

        const id = this.configService.get("atv.id");
        const companionCredentials = this.configService.get("atv.companionCredentials");

        return exec(
            `ssh ${user}@${host} 'pyenv exec atvremote --id ${id} --companion-credentials ${companionCredentials} ${command}'`,
            {
                env: {
                    PATH: process.env.PATH,
                },
            },
            (err) => {
                if (err) {
                    this.loggerService.error(err);
                }
            },
        );
    }
}
