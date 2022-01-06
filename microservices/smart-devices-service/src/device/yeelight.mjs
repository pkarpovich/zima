import * as miio from "miio-api";

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

  async connect({ ip: address, token }) {
    try {
      const d = await miio.device({ address, token });
      this.#instance = d;
      console.log(`Yeelight device connected, ip: ${address}`);
      return d;
    } catch (err) {
      console.error(
        `Can't connect to yeelight device, ip: ${address}, error: `,
        err
      );
    }
  }

  async getPowerState() {
    const [state] = await this.#instance.call("get_prop", ["power"]);
    return state === "on";
  }

  async getBrightness() {
    const state = await this.#instance.call("get_prop", ["bright"]);
    return state[0];
  }

  async setBrightness(brightness) {
    await this.#instance.call("set_bright", [brightness]);
  }

  async getRGB() {
    const [state] = await this.#instance.call("get_prop", ["rgb"]);
    return codeToRgb(state);
  }

  async setColor([r, g, b]) {
    try {
      console.log(
        `Try to change color on device ${
          this.#instance.id
        } to color ${r}, ${g}, ${b}`
      );
      return this.#instance.call("set_rgb", [
        rgbToCode(r, g, b),
        "sudden",
        1000,
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  async setPower(status) {
    console.log(
      `Try to change power status on device ${this.#instance.id} to ${status}`
    );
    const [newState] = await this.#instance.call(
      "set_power",
      status ? ["on"] : ["off"]
    );
    return newState === "on";
  }
}
