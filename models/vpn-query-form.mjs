import { BaseQueryForm } from "./base-query-form.mjs";
import { TokenTypes } from "../constants/token-types.mjs";

export class VpnQueryForm extends BaseQueryForm {
  constructor() {
    super({
      name: "VPN Form",
      keywords: ["vpn"],
      props: [
        {
          name: "VPN location",
          type: TokenTypes.COUNTRY,
          value: null,
          clarifyingQuestion: "In which country turn on VPN?",
        },
      ],
    });
  }

  initProps(customEntities) {
    super.initProps(customEntities);
  }

  execute() {
    super.execute();
  }
}
