import { Lookup } from "node-yeelight-wifi-extended";

export class YeelightService {
  #lookup = null;

  #devices = [];

  #flowIntervalId = null;

  constructor() {
    this.#lookup = new Lookup();

    this.#lookup.on("detected", (light) => {
      this.#devices.push(light);

      console.log("new yeelight detected: id=", light.id, "name=", light.name);
    });
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
    for (let device of this.#devices) {
      const color = this.getRandomColor();
      await this.setColor(device, color);
    }
  }

  async setOneColorOnEveryLight(color) {
    for (let device of this.#devices) {
      await this.setColor(device, color);
    }
  }

  async setColor(device, rgb) {
    try {
      console.log(`Try to change color on device ${device.id} to color ${rgb}`);
      await device.setPower(true);
      await device.setRGB(rgb);
    } catch (e) {
      console.error(e);
    }
  }

  async setPower(status) {
    try {
      for (let device of this.#devices) {
        await device.setPower(status);
      }
    } catch {}
  }
}
