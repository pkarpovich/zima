import hap from "hap-nodejs";
import colorConvert from "color-convert";

const HSBToRGB = (h, s, b) => {
  s /= 100;
  b /= 100;
  const k = (n) => (n + h / 60) % 6;
  const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return [
    Math.round(255 * f(5)),
    Math.round(255 * f(3)),
    Math.round(255 * f(1)),
  ];
};

export class YeelightHomekit {
  instance = null;

  saturationValue = 0;

  constructor(instance, { uuid, name, username, pincode, port }) {
    this.instance = instance;

    this.getPowerState = this.getPowerState.bind(this);
    this.setPowerState = this.setPowerState.bind(this);

    this.getBrightness = this.getBrightness.bind(this);
    this.setBrightness = this.setBrightness.bind(this);

    this.getHue = this.getHue.bind(this);
    this.setHue = this.setHue.bind(this);

    this.setSaturation = this.setSaturation.bind(this);
    this.getSaturation = this.getSaturation.bind(this);

    const Accessory = hap.Accessory;
    const Characteristic = hap.Characteristic;
    const CharacteristicEventTypes = hap.CharacteristicEventTypes;
    const Service = hap.Service;
    const { On, Hue, Brightness, Saturation } = Characteristic;

    const accessoryUuid = hap.uuid.generate(uuid);
    const accessory = new Accessory(name, accessoryUuid);

    const lightService = new Service.Lightbulb(name);

    const power = lightService.getCharacteristic(On);
    const hue = lightService.getCharacteristic(Hue);
    const brightness = lightService.getCharacteristic(Brightness);
    const saturation = lightService.getCharacteristic(Saturation);

    saturation.on(CharacteristicEventTypes.SET, this.setSaturation);
    saturation.on(CharacteristicEventTypes.GET, this.getSaturation);

    power.on(CharacteristicEventTypes.GET, this.getPowerState);
    power.on(CharacteristicEventTypes.SET, this.setPowerState);

    brightness.on(CharacteristicEventTypes.GET, this.getBrightness);
    brightness.on(CharacteristicEventTypes.SET, this.setBrightness);

    hue.on(CharacteristicEventTypes.GET, this.getHue);
    hue.on(CharacteristicEventTypes.SET, this.setHue);

    accessory.addService(lightService);
    accessory.publish({
      username,
      pincode,
      port,
      category: hap.Categories.LIGHTBULB,
    });
  }

  async getBrightness(callback) {
    const currentBrightnessLevel = await this.instance.getBrightness();
    callback(undefined, currentBrightnessLevel);
  }

  async setBrightness(value, callback) {
    await this.instance.setBrightness(value);
    callback(undefined);
  }

  async getPowerState(callback) {
    const state = await this.instance.getPowerState();
    callback(undefined, state);
  }

  async setPowerState(value, callback) {
    await this.instance.setPower(value);
    callback(undefined);
  }

  async getHue(callback) {
    const [r, g, b] = await this.instance.getRGB();
    const hsl = colorConvert.rgb.hsl(r, g, b);
    callback(undefined, hsl[0]);
  }

  async setHue(h, callback) {
    const b = await this.instance.getBrightness();
    const rgb = HSBToRGB(h, this.saturationValue, +b);
    await this.instance.setColor(rgb);

    callback(undefined);
  }

  async setSaturation(s, callback) {
    this.saturationValue = s;
    callback(undefined);
  }

  async getSaturation(callback) {
    const [r, g, b] = await this.instance.getRGB();
    const hsl = colorConvert.rgb.hsl(r, g, b);
    callback(undefined, hsl[1]);
  }
}
