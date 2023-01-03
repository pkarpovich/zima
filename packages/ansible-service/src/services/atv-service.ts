import { exec } from "child_process";
import { ConfigService, LoggerService } from "shared/src/services.js";
import { IConfig } from "../config/config.js";

export class AtvService {
  constructor(
    private readonly configService: ConfigService<IConfig>,
    private readonly loggerService: LoggerService
  ) {}

  async execute(command: string) {
    const host = this.configService.get("SSH.Host");
    const user = this.configService.get("SSH.Username");

    return exec(
      `ssh ${user}@${host} '$HOME/.local/bin/atvremote --id $ATV_ID --companion-credentials $ATV_COMPANION_CREDENTIALS turn_on' ${command}`,
      {
        env: {
          PATH: process.env.PATH,
        },
      },
      (err) => {
        if (err) {
          this.loggerService.error(err);
        }
      }
    );
  }
}
