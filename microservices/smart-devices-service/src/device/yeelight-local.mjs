import { Yeelight } from "yeelight-node";
import { retry } from "../utils/retry.mjs";
import { LogService } from "../services/log.service.mjs";

export class YeelightDevice {
  id = null;

  #instance = null;

  #logService = null;
  constructor({ id }) {
    this.id = id;
    this.#logService = new LogService();
    this.#logService.context = {
      scope: this.#logService.createScope(id),
    };
  }

  async connect({ ip: address, port }) {
    return retry(this.#connectToLocalInstance(address, port));
  }

  async setBrightness(b) {
    this.#logService.info(`Try to change brightness to ${b} %`);
    return this.#setProp("set_bright", b);
  }

  async setHsv(hue, sat) {
    this.#logService.info(`Try to change color to hue ${hue} and sat ${sat}`);
    return this.#setProp("set_hsv", hue, sat, "smooth", 400);
  }

  async setTemperature(mired) {
    const kelvin = 10 ** 6 / mired;
    this.#logService.info(`Try to change temperature to ${kelvin} K`);
    return this.#setProp("set_ct_abx", kelvin, "smooth", 400);
  }

  async setColor(rgb) {
    this.#logService.info(`Try to change color to rgb ${rgb}`);
    return this.#setProp("set_rgb", rgb);
  }

  async setPower(p) {
    this.#logService.info(`Try to change power to ${p}`);
    return this.#setProp("set_power", p ? "on" : "off");
  }

  async getBrightness() {
    return this.#getProp("bright", 0);
  }

  async getPower() {
    const result = await this.#getProp("power", "off");
    return result === "on";
  }

  #connectToLocalInstance = (address, port) => {
    return () =>
      new Promise(async (resolve, reject) => {
        this.#logService.info(
          `Try to connect to local yeelight device, ip: ${address}, port: ${port}`
        );

        try {
          this.#instance = new Yeelight({ ip: address, port: port });

          await this.#instance.get_prop("power");
          this.#logService.success(
            `Yeelight device connected, ip: ${address}, port: ${port}`
          );
          resolve(this.#instance);
        } catch (e) {
          this.#logService.error(
            `Can't connect to yeelight device, ip: ${address}, port: ${port}, error`,
            e
          );

          reject(e);
        }
      });
  };

  #processGetResponse = (resp) => {
    return JSON.parse(resp);
  };

  #getProp = async (name, defaultValue) => {
    try {
      const resp = await this.#instance.get_prop(name);
      const { result } = this.#processGetResponse(resp);

      return result[0];
    } catch (e) {
      this.#logService.error(
        `Can't get property ${name} from yeelight device, error: `,
        e
      );
    }

    return defaultValue;
  };

  #setProp = async (name, ...value) => {
    try {
      return this.#instance[name](...value);
    } catch (e) {
      this.#logService.error(
        `Can't set property ${name} to ${value} on yeelight device, error: `,
        e
      );
    }
  };
}
