import * as hap from "hap-nodejs";
import { Nullable } from "shared/src/types.js";
import { IHomekitDevice } from "../types/homekit-device.type.js";
import { YeelightDevice } from "./yeelight-local.js";

export class YeelightHomekit {
  public id: string;

  private instance: YeelightDevice;

  private hue: hap.CharacteristicValue = 255;

  private sat: hap.CharacteristicValue = 45;

  private temp: hap.CharacteristicValue = 588;

  private brightness: hap.CharacteristicValue = 100;

  private power: hap.CharacteristicValue = false;

  readonly powerService: hap.Characteristic;

  readonly saturationService: Nullable<hap.Characteristic> = null;

  readonly hueService: Nullable<hap.Characteristic> = null;

  constructor(
    instance: YeelightDevice,
    {
      uuid,
      name,
      username,
      pincode,
      homekitPort: port,
      hasRGB = false,
    }: IHomekitDevice
  ) {
    this.instance = instance;
    this.id = uuid;

    this.setTemperature = this.setTemperature.bind(this);
    this.setPowerState = this.setPowerState.bind(this);
    this.getPowerState = this.getPowerState.bind(this);
    this.setBrightness = this.setBrightness.bind(this);
    this.getBrightness = this.getBrightness.bind(this);
    this.setSaturation = this.setSaturation.bind(this);
    this.setHue = this.setHue.bind(this);

    const { Accessory, Characteristic, CharacteristicEventTypes, Service } =
      hap;

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
      .on(CharacteristicEventTypes.GET, this.getBrightness)
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

  async setBrightness(
    value: hap.CharacteristicValue,
    callback: hap.CharacteristicSetCallback
  ) {
    this.brightness = value;
    await this.instance.setBrightness(+value);
    callback(undefined);
  }

  async getBrightness(callback: hap.CharacteristicGetCallback) {
    this.brightness = await this.instance.getBrightness();
    callback(undefined, this.brightness);
  }

  async setPowerState(
    value: hap.CharacteristicValue,
    callback: hap.CharacteristicSetCallback
  ) {
    this.power = value;
    await this.instance.setPower(value as boolean);
    callback(undefined);
  }

  async getPowerState(callback: hap.CharacteristicGetCallback) {
    this.power = await this.instance.getPower();
    callback(undefined, this.power);
  }

  async setHue(
    h: hap.CharacteristicValue,
    callback: hap.CharacteristicSetCallback
  ) {
    this.hue = h;
    await this.setColor();

    callback(undefined);
  }

  async setSaturation(
    s: hap.CharacteristicValue,
    callback: hap.CharacteristicSetCallback
  ) {
    this.sat = s;
    await this.setColor();
    callback(undefined);
  }

  async setTemperature(
    value: hap.CharacteristicValue,
    callback: hap.CharacteristicSetCallback
  ) {
    if (this.power) {
      this.temp = value;
      await this.instance.setTemperature(+value);
    }

    callback(null);
  }

  async setColor() {
    await this.instance.setHsv(+this.hue, +this.sat);
  }

  updateColor(
    h: hap.CharacteristicValue,
    s: hap.CharacteristicValue,
    _v?: hap.CharacteristicValue
  ) {
    this.hueService?.updateValue(h);
    this.saturationService?.updateValue(s);
  }
}
