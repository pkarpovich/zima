import { Yeelight } from "yeelight-node";
import { retry } from "../utils/retry.mjs";

export class YeelightDevice {
  id = null;

  #instance = null;

  constructor({ id }) {
    this.id = id;
  }

  async connect({ ip: address, port }) {
    return retry(this.#connectToLocalInstance(address, port));
  }

  async setBrightness(b) {
    try {
      console.log(`Try to change Brightness on device ${this.id} to ${b}`);
      await this.#instance.set_bright(b);
    } catch (e) {
      console.error(e);
    }
  }

  async getBrightness() {
    try {
      const resp = await this.#instance.get_prop("bright");
      const { result } = this.#processGetResponse(resp);

      return result[0];
    } catch (e) {
      console.error(e);
    }
  }

  async setHsv(hue, sat) {
    try {
      console.log(`Try to change HUE on device ${this.id} to ${hue}K`);
      return this.#instance.set_hsv(hue, sat, "smooth", 400);
    } catch (e) {
      console.error(e);
    }
  }

  async setTemperature(mired) {
    try {
      const kelvin = 10 ** 6 / mired;
      console.log(
        `Try to change temperature on device ${this.id} to ${kelvin}K`
      );
      return this.#instance.set_ct_abx(kelvin, "smooth", 400);
    } catch (e) {
      console.error(e);
    }
  }

  async setColor(rgb) {
    try {
      console.log(`Try to change color on device ${this.id} to color ${rgb}`);
      return this.#instance.set_rgb(rgb);
    } catch (e) {
      console.error(e);
    }
  }

  async setPower(p) {
    try {
      console.log(`Try to change power status on device ${this.id} to ${p}`);
      return this.#instance.set_power(p ? "on" : "off");
    } catch (e) {
      console.error(e);
    }
  }

  async getPower() {
    try {
      const resp = await this.#instance.get_prop("power");
      const { result } = this.#processGetResponse(resp);

      return result[0] === "on";
    } catch (e) {
      console.error(e);
    }
  }

  #connectToLocalInstance = (address, port) => {
    return () =>
      new Promise(async (resolve, reject) => {
        console.log(
          `Try to connect to device ${this.id} on ${address}:${port}`
        );
        try {
          this.#instance = new Yeelight({ ip: address, port: port });

          await this.#instance.get_prop("power");
          console.log(`Connected to device ${this.id} on ${address}:${port}`);
          resolve(this.#instance);
        } catch (e) {
          console.log(
            `Error while connecting to device ${this.id} on ${address}:${port}`,
            e.code
          );

          reject(e);
        }
      });
  };

  #processGetResponse = (resp) => {
    return JSON.parse(resp);
  };
}
