import colorConvert from "color-convert";
import { Nullable } from "shared/src/types.js";
import { YeelightDevice } from "../device/yeelight-local.js";
import { YeelightHomekit } from "../device/yeelight-homekit.js";
import { IHomekitDevice } from "../types/homekit-device.type";

export class YeelightService {
  devices = new Map<string, YeelightDevice[]>();

  private homekitDevices: YeelightHomekit[] = [];

  constructor(devices: IHomekitDevice[]) {
    this.discoverDevices(devices);
  }

  private async discoverDevices(devices: IHomekitDevice[]) {
    for (const d of devices) {
      const instance = new YeelightDevice({ id: d.uuid });
      await instance.connect({ ip: d.ip, port: d.port });

      const homekitInstance = new YeelightHomekit(instance, d);

      if (d.zone) {
        const zoneDevices = this.devices.get(d.zone) || [];
        this.devices.set(d.zone, [...zoneDevices, instance]);
      }

      this.homekitDevices.push(homekitInstance);
    }
  }

  getRandomColor(): [number, number, number] {
    const randomBetween = (min: number, max: number) =>
      min + Math.floor(Math.random() * (max - min + 1));

    const r = randomBetween(0, 255);
    const g = randomBetween(0, 255);
    const b = randomBetween(0, 255);

    return [r, g, b];
  }

  async setRandomColor(zones: string[]) {
    const color = this.getRandomColor();
    return this.setOneColorOnEveryLight(color, zones);
  }

  async setRandomColorInEveryLight(zones: string[]) {
    const devices = this.getTargetDevicesByZones(zones);

    for (const device of devices) {
      const color = this.getRandomColor();
      await device.setColor(color);

      this.getHomekitDevicesById(device.id)?.updateColor(
        ...colorConvert.rgb.hsv(...color)
      );
    }
  }

  async setOneColorOnEveryLight(
    color: [number, number, number],
    zones: string[]
  ) {
    const devices = this.getTargetDevicesByZones(zones);

    for (const device of devices) {
      await device.setColor(color);

      this.getHomekitDevicesById(device.id)?.updateColor(
        ...colorConvert.rgb.hsv(color)
      );
    }
  }

  async setPower(status: boolean, zones: string[], brightness = 100) {
    const devices = this.getTargetDevicesByZones(zones);

    for (const device of devices) {
      await device.setPower(status);
      await device.setBrightness(brightness);
      this.getHomekitDevicesById(device.id)?.powerService.updateValue(status);
    }
  }

  getTargetDevicesByZones(zones: string[]): YeelightDevice[] {
    return zones.length > 0
      ? zones.reduce<YeelightDevice[]>((d, current) => {
          d.push(...(this.devices.get(current) || []));
          return d;
        }, [])
      : Array.from(this.devices.values()).flat(1);
  }

  getHomekitDevicesById(id: string): Nullable<YeelightHomekit> {
    return this.homekitDevices.find((hd) => hd.id === id);
  }
}
