import { BaseQueryForm } from "./base-query-form.mjs";
import { Action } from "./action.mjs";

const ActionTypes = {
  SetYeelightRandomColor: "set-yeelight-random-color",
  TurnOnYeelight: "turn-on-yeelight",
  TurnOffYeelight: "turn-off-yeelight",
};

export class SmartDevicesQueryForm extends BaseQueryForm {
  #rabbitService = null;

  #configService = null;

  constructor({ rabbitService, configService }) {
    super({
      name: "Smart Devices Form",
      globalKeywords: ["light"],
      actions: [
        new Action({
          actionType: ActionTypes.SetYeelightRandomColor,
          keywords: ["set random color"],
        }),
        new Action({
          actionType: ActionTypes.TurnOnYeelight,
          keywords: ["turn on"],
        }),
        new Action({
          actionType: ActionTypes.TurnOffYeelight,
          keywords: ["turn off"],
        }),
      ],
    });

    const actionHandlers = {
      [ActionTypes.SetYeelightRandomColor]:
        this.setYeelightRandomColor.bind(this),
      [ActionTypes.TurnOnYeelight]: this.turnOnYeelight.bind(this),
      [ActionTypes.TurnOffYeelight]: this.turnOffYeelight.bind(this),
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const action of this.actions) {
      action.handler = actionHandlers[action.actionType];
    }

    this.#rabbitService = rabbitService;
    this.#configService = configService;
  }

  async sendYeelightMessage(name) {
    const queueName = this.#configService.get("Rabbit.SmartDevicesQueueName");

    await this.#rabbitService.createConnection();

    await this.#rabbitService.sendToChannelWithResponse(
      queueName,
      JSON.stringify({ name })
    );

    await this.#rabbitService.closeConnection();

    return {
      status: "DONE",
    };
  }

  async setYeelightRandomColor() {
    return this.sendYeelightMessage("set-yeelight-random-color");
  }

  async turnOnYeelight() {
    return this.sendYeelightMessage("turn-on-yeelight");
  }

  async turnOffYeelight() {
    return this.sendYeelightMessage("turn-off-yeelight");
  }
}
