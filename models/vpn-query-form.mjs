import { BaseQueryForm } from "./base-query-form.mjs";

export class VpnQueryForm extends BaseQueryForm {
  constructor() {
    super({
      name: "VPN Form",
      keywords: ["vpn"],
      props: [],
    });
  }

  execute() {
    super.execute();
  }
}
