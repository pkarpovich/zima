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
    const actionByWord = this.actions.find((a) =>
      a.keywords.some((ak) => tokens.includes(ak))
    );

    if (actionByWord) {
      return actionByWord;
    }

    let actionByPhrase = "";
    tokens.reduce((phrase, token) => {
      const newPhrase = phrase + " " + token;

      const index = this.actions.findIndex((a) =>
        a.keywords.includes(newPhrase.trim())
      );

      if (index !== -1) {
        actionByPhrase = this.actions[index];
      }

      return newPhrase;
    }, "");

    if (actionByPhrase) {
      return actionByPhrase;
    }
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
