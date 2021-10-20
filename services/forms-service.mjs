export class FormsService {
  #forms = [];

  constructor(forms) {
    this.#forms = forms;
  }

  findAndExecute(tokens, customEntities) {
    const { actionId, form } = this.findFormAction(tokens);
    const action = form.initActionProps(actionId, customEntities);
    console.log(action);

    return action.execute();
  }

  findFormAction(tokens) {
    const form = this.#forms.find((f) => f.isTokensMatchWithKeywords(tokens));
    const action = form.getActionByTokens(tokens);

    return {
      form,
      actionId: action.id,
    };
  }
}
