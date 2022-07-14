import { exec } from "child_process";

export class AtvService {
  #configService = null;

  constructor({ configService }) {
    this.#configService = configService;
  }

  async execute(command) {
    const host = this.#configService.get("SSH.Host");
    const user = this.#configService.get("SSH.Username");

    return exec(
      `ssh ${user}@${host} '$HOME/.local/bin/atvremote --id $ATV_ID --companion-credentials $ATV_COMPANION_CREDENTIALS turn_on' ${command}`,
      {
        env: {
          PATH: process.env.PATH,
        },
      },
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  }
}
