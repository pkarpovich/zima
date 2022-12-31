import { ICommand, ICommandSchema } from "../models/commands-model.js";

export class CommandsService {
  constructor(private readonly CommandModel: ICommand) {}

  getLastExistingCommand() {
    return this.CommandModel.findOne({ isUnknownCommand: true }).sort({
      _id: -1,
    });
  }

  async create(command: ICommandSchema): Promise<ICommandSchema> {
    const newCommand = new this.CommandModel({ ...command });
    await newCommand.save();

    return newCommand;
  }
}
