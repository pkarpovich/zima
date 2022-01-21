import { SimpleTriggerHomekit } from "../device/simple-trigger-homekit.mjs";

export class SimpleTriggerService {
  #homekitDevices = [];

  constructor({ config }) {
    for (let device of config) {
      const d = new SimpleTriggerHomekit(device);

      this.#homekitDevices.push(d);
    }
  }
}
