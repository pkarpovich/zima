export class FormsService {
  #forms = [];

  constructor(forms) {
    this.#forms = forms;
  }

  findAndExecute(tokens, customEntities) {
    const form = this.matchTokensWithForm(tokens);
    form.initProps(customEntities);
    form.execute();

    return form;
  }

  matchTokensWithForm(tokens) {
    const form = this.#forms.find(
      (f) => tokens.findIndex((t) => f.keywords.includes(t)) !== -1
    );
    const clone = form ? { ...form } : null;
    Object.setPrototypeOf(clone, Object.getPrototypeOf(form));

    return clone;
  }
}
