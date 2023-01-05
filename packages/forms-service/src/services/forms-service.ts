import { difference as _difference } from "lodash-es";
import { TokenTypes } from "shared/constants";
import { FormTypes } from "shared/enums";
import { IForm, IFormSchema } from "../models/forms-model.js";
import { IActionSchema } from "../models/actions-model.js";

export class FormsService {
  constructor(private readonly FormModel: IForm) {}

  getAll() {
    return this.FormModel.find({});
  }

  async getFormActionByTokens(
    tokens: string[]
  ): Promise<[IFormSchema, IActionSchema]> {
    const tokenSets = this.getTokenSets(tokens);

    let form = await this.FormModel.findOne({
      globalKeywords: { $in: tokenSets },
    });

    if (!form) {
      form = await this.FormModel.findOne({
        type: FormTypes.System,
      });
    }

    if (!form) {
      throw new Error("No form found");
    }

    const action =
      form?.actions.find(
        (a) => !!tokenSets.find((token) => a.keywords.includes(token))
      ) ?? null;

    if (!action) {
      throw new Error("No action found");
    }

    return [form, action];
  }

  private getTokenSets(tokens: string[]): string[] {
    return Array.from(
      new Set<string>(
        tokens
          .reduce<string[]>(
            (sets, token, index) =>
              sets.concat(
                index === 0 ? token : [sets[index - 1], token].join(" ")
              ),
            []
          )
          .reverse()
          .concat(...tokens)
      )
    );
  }

  async populateActionWithProps(
    { form, action }: { form: IFormSchema; action: IActionSchema },
    { tokens }: { tokens: string[] }
  ) {
    if (!action.props) {
      return [];
    }

    const props = [];

    for (const prop of action.props) {
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
        default: {
          throw new Error(`Unknown prop type: ${prop.type}`);
        }
      }
    }

    return props;
  }

  async create(form: IFormSchema) {
    const newForm = new this.FormModel({ ...form });
    await newForm.save();

    return newForm;
  }

  async createMany(forms: IFormSchema[]) {
    return this.FormModel.insertMany(forms);
  }

  async removeAll(): Promise<void> {
    await this.FormModel.deleteMany({});
  }

  async getCount(): Promise<number> {
    return this.FormModel.count({});
  }
}
