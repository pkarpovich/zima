import hap from "hap-nodejs";

export class SimpleTriggerHomekit {
  instance = null;

  state = false;

  constructor({ uuid, name, username, pincode, homekitPort: port }) {
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);

    const Accessory = hap.Accessory;
    const Characteristic = hap.Characteristic;
    const CharacteristicEventTypes = hap.CharacteristicEventTypes;
    const Service = hap.Service;
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

  getState(callback) {
    callback(undefined, this.state);
  }

  setState(value, callback) {
    this.state = value;
    callback(undefined);
  }
}
