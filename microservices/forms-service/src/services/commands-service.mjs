export class CommandsService {
  #commandModel = null;

  constructor({ commandModel }) {
    this.#commandModel = commandModel;
  }

  getLastExistingCommand() {
    return this.#commandModel
      .findOne({ isUnknownCommand: true })
      .sort({ _id: -1 });
  }

  async create(command) {
    const newCommand = new this.#commandModel({ ...command });
    await newCommand.save();

    return newCommand;
  }
}
