import { YeelightDevice } from "../device/yeelight-local.mjs";
import { YeelightHomekit } from "../device/yeelight-homekit.mjs";

export class YeelightService {
  #devices = new Map();
  #homekitDevices = [];

  constructor({ yeelightConfig }) {
    this.discoverDevices(yeelightConfig);
  }

  async discoverDevices(devices) {
    for (let d of devices) {
      const instance = new YeelightDevice();
      await instance.connect(d);

      const homekitInstance = new YeelightHomekit(instance, d);

      const zoneDevices = this.#devices.get(d.zone) || [];
      this.#devices.set(d.zone, [...zoneDevices, instance]);
      this.#homekitDevices.push(homekitInstance);
    }
  }

  getRandomColor() {
    const randomBetween = (min, max) =>
      min + Math.floor(Math.random() * (max - min + 1));

    const r = randomBetween(0, 255);
    const g = randomBetween(0, 255);
    const b = randomBetween(0, 255);

    return [r, g, b];
  }

  async setRandomColor(zones) {
    const color = this.getRandomColor();
    return this.setOneColorOnEveryLight(color, zones);
  }

  async setRandomColorInEveryLight(zones) {
    const devices = this.#getTargetDevicesByZones(zones);

    return Promise.all(devices.map((d) => d.setColor(this.getRandomColor())));
  }

  async setOneColorOnEveryLight(color, zones) {
    const devices = this.#getTargetDevicesByZones(zones);

    return Promise.all(devices.map((d) => d.setColor(color)));
  }

  async setPower(status, zones) {
    const devices = this.#getTargetDevicesByZones(zones);

    return Promise.all(devices.map((d) => d.setPower(status)));
  }

  #getTargetDevicesByZones(zones) {
    return zones.length > 0
      ? zones.reduce((d, current) => {
          d.push(...this.#devices.get(current));
          return d;
        }, [])
      : Array.from(this.#devices.values()).flat(1);
  }
}
