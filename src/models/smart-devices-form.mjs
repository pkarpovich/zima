import { BaseQueryForm } from "./base-query-form.mjs";
import { Action } from "./action.mjs";

const ActionTypes = {
  SetYeelightRandomColor: "set-yeelight-random-color",
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
      ],
    });

    const actionHandlers = {
      [ActionTypes.SetYeelightRandomColor]:
        this.setYeelightRandomColor.bind(this),
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const action of this.actions) {
      action.handler = actionHandlers[action.actionType];
    }

    this.#rabbitService = rabbitService;
    this.#configService = configService;
  }

  async setYeelightRandomColor() {
    const queueName = this.#configService.get("Rabbit.SmartDevicesQueueName");

    await this.#rabbitService.createConnection();

    await this.#rabbitService.sendToChannelWithResponse(
      queueName,
      JSON.stringify({ name: "set-yeelight-random-color" })
    );

    await this.#rabbitService.closeConnection();

    return {
      status: "DONE",
    };
  }
}
