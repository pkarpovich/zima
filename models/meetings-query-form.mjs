import { BaseQueryForm } from "./base-query-form.mjs";
import { Action } from "./action.mjs";

const ActionTypes = {
  Start: "start-meeting",
};

export class MeetingsQueryForm extends BaseQueryForm {
  #rabbitService = null;

  #configService = null;

  constructor({ rabbitService, configService }) {
    super({
      name: "Meetings Form",
      globalKeywords: ["meeting"],
      actions: [
        new Action({
          actionType: ActionTypes.Start,
          keywords: ["start"],
        }),
      ],
    });

    const actionHandlers = {
      [ActionTypes.Start]: this.startMeeting.bind(this),
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const action of this.actions) {
      action.handler = actionHandlers[action.actionType];
    }

    this.#rabbitService = rabbitService;
    this.#configService = configService;
  }

  async startMeeting() {
    const queueName = this.#configService.get("Rabbit.MeetingsQueueName");

    await this.#rabbitService.createConnection();

    const { meetingUrl } = await this.#rabbitService.sendToChannelWithResponse(
      queueName,
      "google_meet"
    );

    await this.#rabbitService.closeConnection();

    return {
      status: "DONE",
      clipboard: meetingUrl,
    };
  }
}
