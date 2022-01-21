import { exec } from "child_process";

export class AppleTvService {
  constructor({}) {}

  execute(command) {
    return exec(
      `atvremote --id $ATV_ID --companion-credentials $ATV_COMPANION_CREDENTIALS ${command}`,
      {
        env: {
          ATV_COMPANION_CREDENTIALS: process.env.ATV_COMPANION_CREDENTIALS,
          ATV_ID: process.env.ATV_ID,
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
