import { Yeelight } from "yeelight-node";

export class YeelightDevice {
  id = null;

  #instance = null;

  constructor({ id }) {
    this.id = id;
  }

  async connect({ ip: address, port }) {
    this.#instance = new Yeelight({ ip: address, port: port });
  }

  async setBrightness(b) {
    try {
      console.log(
        `Try to change Brightness on device ${this.#instance.id} to ${b}`
      );
      await this.#instance.set_bright(b);
    } catch (e) {
      console.error(e);
    }
  }

  async setHsv(hue, sat) {
    try {
      console.log(
        `Try to change HUE on device ${this.#instance.id} to ${hue}K`
      );
      return this.#instance.set_hsv(hue, sat, "smooth", 400);
    } catch (e) {
      console.error(e);
    }
  }

  async setTemperature(mired) {
    try {
      const kelvin = 10 ** 6 / mired;
      console.log(
        `Try to change temperature on device ${this.#instance.id} to ${kelvin}K`
      );
      return this.#instance.set_ct_abx(kelvin, "smooth", 400);
    } catch (e) {
      console.error(e);
    }
  }

  async setColor(rgb) {
    try {
      console.log(
        `Try to change color on device ${this.#instance.id} to color ${rgb}`
      );
      return this.#instance.set_rgb(rgb);
    } catch (e) {
      console.error(e);
    }
  }

  async setPower(p) {
    try {
      console.log(
        `Try to change power status on device ${this.#instance.id} to ${p}`
      );
      return this.#instance.set_power(p ? "on" : "off");
    } catch (e) {
      console.error(e);
    }
  }
}
