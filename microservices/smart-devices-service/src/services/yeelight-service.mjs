import { Lookup } from "node-yeelight-wifi-extended";

export class YeelightService {
  #lookup = null;

  #devices = [];

  constructor() {
    this.#lookup = new Lookup();

    this.#lookup.on("detected", (light) => {
      this.#devices.push(light);

      console.log("new yeelight detected: id=", light.id, "name=", light.name);
    });
  }

  async setRandomColor() {
    const randomBetween = (min, max) =>
      min + Math.floor(Math.random() * (max - min + 1));

    const r = randomBetween(0, 255);
    const g = randomBetween(0, 255);
    const b = randomBetween(0, 255);

    return this.setColor([r, g, b]);
  }

  async setColor(rgb) {
    try {
      for (let device of this.#devices) {
        await device.setPower(true);
        await device.setRGB(rgb);
      }
    } catch {}
  }
}
