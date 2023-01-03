import { SimpleTriggerHomekit } from "../device/simple-trigger-homekit.js";
import { IHomekitDevice } from "../types/homekit-device.type.js";

export class SimpleTriggerService {
  private readonly homekitDevices: SimpleTriggerHomekit[] = [];

  constructor(config: IHomekitDevice[]) {
    for (const device of config) {
      const d = new SimpleTriggerHomekit(device);

      this.homekitDevices.push(d);
    }
  }
}
