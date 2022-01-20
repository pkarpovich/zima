import { Yeelight } from "yeelight-node";

function rgbToCode(r, g, b) {
  return r * 65536 + g * 256 + b;
}

function codeToRgb(c) {
  const r = Math.floor(c / (256 * 256));
  const g = Math.floor(c / 256) % 256;
  const b = c % 256;

  return [r, g, b];
}

export class YeelightDevice {
  #instance = null;

  constructor() {}

  async connect({ ip: address, port }) {
    this.#instance = new Yeelight({ ip: address, port: port });
  }

  async getPowerState() {
    const state = this.#parsePropResponse(
      await this.#instance.get_prop("power")
    );
    return state === "on";
  }

  async getBrightness() {
    return this.#parsePropResponse(await this.#instance.get_prop("bright"));
  }

  async setBrightness(brightness) {
    await this.#instance.set_bright(brightness);
  }

  async getRGB() {
    const state = this.#parsePropResponse(await this.#instance.get_prop("rgb"));

    return codeToRgb(state);
  }

  async setColor(rgb) {
    try {
      console.log(
        `Try to change color on device ${this.#instance.id} to color ${
          rgb[0]
        }, ${rgb[1]}, ${rgb[2]}`
      );
      return this.#instance.set_rgb(rgb);
    } catch (e) {
      console.error(e);
    }
  }

  async setPower(status) {
    console.log(
      `Try to change power status on device ${this.#instance.id} to ${status}`
    );
    return this.#instance.set_power(status ? "on" : "off");
  }

  #parsePropResponse(resp) {
    const { result } = JSON.parse(resp);
    const [state] = result;

    return state;
  }
}
