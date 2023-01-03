import * as hap from "hap-nodejs";
import { IHomekitDevice } from "../types/homekit-device.type";

const { Accessory, Characteristic, CharacteristicEventTypes, Service } = hap;

export class SimpleTriggerHomekit {
  private state: hap.CharacteristicValue = false;

  constructor({
    uuid,
    name,
    username,
    pincode,
    homekitPort: port,
  }: IHomekitDevice) {
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);

    const { On } = Characteristic;

    const accessoryUuid = hap.uuid.generate(uuid);
    const accessory = new Accessory(name, accessoryUuid);

    const switchService = new Service.Switch(name);

    const state = switchService.getCharacteristic(On);

    state.on(CharacteristicEventTypes.GET, this.getState);
    state.on(CharacteristicEventTypes.SET, this.setState);

    accessory.addService(switchService);
    accessory.publish({
      username,
      pincode,
      port,
      category: hap.Categories.SWITCH,
    });
  }

  getState(callback: hap.CharacteristicGetCallback) {
    callback(undefined, this.state);
  }

  setState(
    value: hap.CharacteristicValue,
    callback: hap.CharacteristicSetCallback
  ) {
    this.state = value;
    callback(undefined);
  }
}
