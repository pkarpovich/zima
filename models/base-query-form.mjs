export class BaseQueryForm {
  name = "";

  globalKeywords = [];

  actions = [];

  constructor({ name, globalKeywords, actions }) {
    this.name = name;
    this.globalKeywords = globalKeywords;
    this.actions = actions;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async execute() {}

  isTokensMatchWithKeywords(tokens) {
    return tokens.some((t) => this.globalKeywords.includes(t));
  }

  getActionByTokens(tokens) {
    return this.actions.find((a) =>
      a.keywords.some((ak) => tokens.includes(ak))
    );
  }

  initActionProps(actionId, customEntities) {
    const action = this.actions.find((a) => a.id === actionId);

    for (let i = 0; i < action.props.length; i++) {
      const { value } = customEntities.find(
        (ce) => ce.type === action.props[i].type
      );
      action.props[i].value = value;
    }

    return action;
  }
}
