import { nanoid } from "nanoid";

export class Action {
  id = null;

  actionType = null;

  keywords = [];

  props = [];

  handler = null;

  constructor({ actionType, keywords, props, handler }) {
    this.id = nanoid();
    this.actionType = actionType;
    this.keywords = keywords;
    this.props = props;
    this.handler = handler;
  }

  getPropByType(type) {
    return this.props.find((p) => p.type === type);
  }

  execute() {
    this.handler?.(this);
  }
}
