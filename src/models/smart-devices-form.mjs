import { ActionTypes } from "shared/constants.mjs";

import { BaseQueryForm } from "./base-query-form.mjs";
import { Action } from "./action.mjs";

export class SmartDevicesQueryForm extends BaseQueryForm {
  #rabbitService = null;

  #configService = null;

  constructor({ rabbitService, configService }) {
    super({
      name: "Smart Devices Form",
      globalKeywords: ["light"],
      actions: [
        new Action({
          actionType: ActionTypes.SmartDevices.SetYeelightRandomColor,
          keywords: ["set random color"],
        }),
        new Action({
          actionType: ActionTypes.SmartDevices.TurnOnYeelight,
          keywords: ["turn on"],
        }),
        new Action({
          actionType: ActionTypes.SmartDevices.TurnOffYeelight,
          keywords: ["turn off"],
        }),
      ],
    });

    const actionHandlers = {
      [ActionTypes.SmartDevices.SetYeelightRandomColor]:
        this.setYeelightRandomColor.bind(this),
      [ActionTypes.SmartDevices.TurnOnYeelight]: this.turnOnYeelight.bind(this),
      [ActionTypes.SmartDevices.TurnOffYeelight]:
        this.turnOffYeelight.bind(this),
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
    return this.sendYeelightMessage(
      ActionTypes.SmartDevices.SetYeelightRandomColor
    );
  }

  async turnOnYeelight() {
    return this.sendYeelightMessage(ActionTypes.SmartDevices.TurnOnYeelight);
  }

  async turnOffYeelight() {
    return this.sendYeelightMessage(ActionTypes.SmartDevices.TurnOffYeelight);
  }
}
