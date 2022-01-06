import * as miio from "miio-api";

function rgbToCode(r, g, b) {
  return r * 65536 + g * 256 + b;
}

export class YeelightDevice {
  #instance = null;

  constructor({ ip: address, token }) {
    miio
      .device({
        address,
        token,
      })
      .then((d) => {
        console.log(`Yeelight device connected, ip: ${address}`);
        this.#instance = d;
      })
      .catch((e) =>
        console.error(
          `Can't connect to yeelight device, ip: ${address}, error: `,
          e
        )
      );
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
    return this.#instance.call("set_power", status ? ["on"] : ["off"]);
  }
}
