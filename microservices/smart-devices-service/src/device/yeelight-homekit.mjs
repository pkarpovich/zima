import hap from "hap-nodejs";

export class YeelightHomekit {
  id = null;
  instance = null;

  hue = 255;
  sat = 45;
  temp = 588;
  brightness = 100;
  power = false;

  saturationService = null;
  powerService = null;
  hueService = null;

  constructor(
    instance,
    { uuid, name, username, pincode, homekitPort: port, hasRGB = false }
  ) {
    this.instance = instance;
    this.id = uuid;

    this.setTemperature = this.setTemperature.bind(this);
    this.setPowerState = this.setPowerState.bind(this);
    this.getPowerState = this.getPowerState.bind(this);
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

    this.powerService = lightService
      .getCharacteristic(On)
      .on(CharacteristicEventTypes.SET, this.setPowerState)
      .on(CharacteristicEventTypes.GET, this.getPowerState)
      .updateValue(this.power);

    lightService
      .getCharacteristic(Brightness)
      .on(CharacteristicEventTypes.SET, this.setBrightness)
      .updateValue(this.brightness);

    if (hasRGB) {
      this.saturationService = lightService
        .getCharacteristic(Saturation)
        .on(CharacteristicEventTypes.SET, this.setSaturation)
        .updateValue(this.sat);

      this.hueService = lightService
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

  async getPowerState(callback) {
    this.power = await this.instance.getPower();
    callback(undefined, this.power);
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
    if (this.power) {
      this.temp = value;
      await this.instance.setTemperature(value);
    }

    callback(null);
  }

  async setColor() {
    await this.instance.setHsv(this.hue, this.sat);
  }

  updateColor(h, s) {
    this.hueService.updateValue(h);
    this.saturationService.updateValue(s);
  }
}
