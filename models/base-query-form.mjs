export class BaseQueryForm {
  #name = "";

  #keywords = [];

  #props = [];

  constructor({ name, keywords, props }) {
    this.#name = name;
    this.#keywords = keywords;
    this.#props = props;
  }

  execute = () => {};
}
