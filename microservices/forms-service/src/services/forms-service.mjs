import { difference as _difference } from "lodash-es";
import { TokenTypes } from "shared/src/constants.ts";
import { FormTypes } from "shared/src/form-types.ts";

export class FormsService {
  #formModel = null;

  constructor({ formModel }) {
    this.#formModel = formModel;
  }

  getAll() {
    return this.#formModel.find({});
  }

  async getFormActionByTokens(tokens) {
    const tokenSets = this.#getTokenSets(tokens);

    let form = await this.#formModel.findOne({
      globalKeywords: { $in: tokenSets },
    });

    if (!form) {
      form = await this.#formModel.findOne({
        type: FormTypes.System,
      });
    }

    const action =
      form?.actions.find(
        (a) => !!tokenSets.find((token) => a.keywords.includes(token))
      ) ?? null;

    return [form, action];
  }

  #getTokenSets(tokens) {
    return Array.from(
      new Set(
        tokens
          .reduce(
            (sets, token, index) =>
              sets.concat(
                index === 0 ? token : [sets[index - 1], token].join(" ")
              ),
            []
          )
          .reverse()
          .concat(tokens)
      )
    );
  }

  async populateActionWithProps({ form, action }, { tokens, customEntities }) {
    if (!action.props) {
      return [];
    }

    const props = [];

    for (let prop of action.props) {
      switch (prop.type) {
        case TokenTypes.RemainingWords: {
          props.push({
            name: prop.name,
            value: _difference(
              tokens,
              form.globalKeywords.concat(
                action.keywords.map((k) => k.split(" ")).flat(1)
              )
            ).join(" "),
          });
          break;
        }
      }
    }

    return props;
  }

  async create(form) {
    const newForm = new this.#formModel({ ...form });
    await newForm.save();

    return newForm;
  }

  async createMany(forms) {
    return this.#formModel.insertMany(forms);
  }

  async removeAll() {
    return this.#formModel.deleteMany({});
  }

  async getCount() {
    return this.#formModel.count({});
  }
}
