import { exec } from "child_process";

export class AppleTvService {
  constructor({}) {}

  execute(command) {
    return exec(
      `atvremote --id $ATV_ID --companion-credentials $ATV_COMPANION_CREDENTIALS ${command}`
    );
  }
}
