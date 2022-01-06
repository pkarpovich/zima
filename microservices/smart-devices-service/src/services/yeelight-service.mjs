import { YeelightDevice } from "../device/yeelight.mjs";
import { YeelightHomekit } from "../device/yeelight-homekit.mjs";

export class YeelightService {
  #devices = [];
  #homekitDevices = [];

  #flowIntervalId = null;

  constructor({ yeelightConfig }) {
    this.discoverDevices(yeelightConfig);
  }

  async discoverDevices(devices) {
    for (let d of devices) {
      const instance = new YeelightDevice();
      await instance.connect(d);
      const homekitInstance = new YeelightHomekit(instance, d);

      this.#devices.push(instance);
      this.#homekitDevices.push(homekitInstance);
    }
  }

  stopFlowMode() {
    clearInterval(this.#flowIntervalId);
  }

  startFlowMode() {
    let i = 0;
    const frequency = 0.2;
    const amplitude = 115;
    const center = 140;

    this.#flowIntervalId = setInterval(async () => {
      ++i;

      if (i === 32) {
        i = 0;
      }

      const r = Math.round(Math.sin(frequency * i + 0) * amplitude + center);
      const g = Math.round(Math.sin(frequency * i + 2) * amplitude + center);
      const b = Math.round(Math.sin(frequency * i + 4) * amplitude + center);
      await this.setOneColorOnEveryLight([r, g, b]);
    }, 1000);
  }

  getRandomColor() {
    const randomBetween = (min, max) =>
      min + Math.floor(Math.random() * (max - min + 1));

    const r = randomBetween(0, 255);
    const g = randomBetween(0, 255);
    const b = randomBetween(0, 255);

    return [r, g, b];
  }

  async setRandomColor() {
    const color = this.getRandomColor();
    return this.setOneColorOnEveryLight(color);
  }

  async setRandomColorInEveryLight() {
    return Promise.all(
      this.#devices.map((d) => d.setColor(this.getRandomColor()))
    );
  }

  async setOneColorOnEveryLight(color) {
    return Promise.all(this.#devices.map((d) => d.setColor(color)));
  }

  async setPower(status) {
    return Promise.all(this.#devices.map((d) => d.setPower(status)));
  }
}
