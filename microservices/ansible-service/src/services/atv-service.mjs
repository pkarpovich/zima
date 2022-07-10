export class AtvService {
  #ansibleService = null;

  constructor({ ansibleService }) {
    this.#ansibleService = ansibleService;
  }

  async execute(command) {
    return this.#ansibleService.run("atv-command", {
      command,
    });
  }
}
