export class BaseQueryForm {
  name = "";

  keywords = [];

  props = [];

  constructor({ name, keywords, props }) {
    this.name = name;
    this.keywords = keywords;
    this.props = props;
  }

  // eslint-disable-next-line class-methods-use-this
  execute() {}

  initProps(customEntities) {
    for (let i = 0; i < this.props.length; i++) {
      const { value } = customEntities.find(
        (ce) => ce.type === this.props[i].type
      );
      this.props[i].value = value;
    }
  }
}
