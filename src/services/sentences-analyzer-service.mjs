import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const countriesInfo = require("../ai-models/countries-info.json");

export class SentencesAnalyzerService {
  #nlp = null;

  #its = null;

  #as = null;

  constructor() {
    this.#nlp = winkNLP(model);
    this.#its = this.#nlp.its;
    this.#as = this.#nlp.as;

    this.#nlp.learnCustomEntities([
      {
        name: "COUNTRY",
        patterns: countriesInfo.map((country) => country.name),
      },
    ]);
  }

  analyze(text) {
    const doc = this.#nlp.readDoc(text);

    const customEntities = doc
      .entities()
      .out(this.#its.detail)
      .concat(doc.customEntities().out(this.#its.detail));

    return {
      customEntities,
      tokens: doc.tokens().out(),
      pos: doc.tokens().out(this.#its.pos),
    };
  }
}
