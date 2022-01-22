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

  hue = 255;
  sat = 45;
  temp = 588;
  brightness = 100;
  power = true;

  constructor(
    instance,
    { uuid, name, username, pincode, homekitPort: port, hasRGB = false }
  ) {
    this.instance = instance;

    this.setTemperature = this.setTemperature.bind(this);
    this.setPowerState = this.setPowerState.bind(this);
    this.setBrightness = this.setBrightness.bind(this);
    this.setSaturation = this.setSaturation.bind(this);
    this.setHue = this.setHue.bind(this);

    const Accessory = hap.Accessory;
    const Characteristic = hap.Characteristic;
    const CharacteristicEventTypes = hap.CharacteristicEventTypes;
    const Service = hap.Service;
    const { On, Hue, Brightness, Saturation, ColorTemperature } =
      Characteristic;

    const accessoryUuid = hap.uuid.generate(uuid);
    const accessory = new Accessory(name, accessoryUuid);

    const lightService = new Service.Lightbulb(name);

    lightService
      .getCharacteristic(On)
      .on(CharacteristicEventTypes.SET, this.setPowerState)
      .updateValue(this.power);

    lightService
      .getCharacteristic(Brightness)
      .on(CharacteristicEventTypes.SET, this.setBrightness)
      .updateValue(this.brightness);

    if (hasRGB) {
      lightService
        .getCharacteristic(Saturation)
        .on(CharacteristicEventTypes.SET, this.setSaturation)
        .updateValue(this.sat);

      lightService
        .getCharacteristic(Hue)
        .on(CharacteristicEventTypes.SET, this.setHue)
        .updateValue(this.hue);

      lightService
        .getCharacteristic(ColorTemperature)
        .on(CharacteristicEventTypes.SET, this.setTemperature)
        .setProps({
          minValue: 154,
          maxValue: 588,
        })
        .updateValue(this.temp);

      accessory.configureController(
        new hap.AdaptiveLightingController(lightService)
      );
    }

    accessory.addService(lightService);
    accessory.publish({
      username,
      pincode,
      port,
      category: hap.Categories.LIGHTBULB,
    });
  }

  async setBrightness(value, callback) {
    this.brightness = value;
    await this.instance.setBrightness(value);
    callback(undefined);
  }

  async setPowerState(value, callback) {
    this.power = value;
    await this.instance.setPower(value);
    callback(undefined);
  }

  async setHue(h, callback) {
    this.hue = h;
    await this.setColor();

    callback(undefined);
  }

  async setSaturation(s, callback) {
    this.sat = s;
    await this.setColor();
    callback(undefined);
  }

  async setTemperature(value, callback) {
    this.temp = value;
    await this.instance.setTemperature(value);
    callback(null);
  }

  async setColor() {
    await this.instance.setHsv(this.hue, this.sat);
  }
}
