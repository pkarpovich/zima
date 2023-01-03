import mongoose from "mongoose";

const { Schema } = mongoose;

export interface ICommandSchema {
  command: string;
  isUnknownCommand: boolean;
}

export const CommandSchema: mongoose.Schema<ICommandSchema> = new Schema(
  {
    command: {
      type: String,
      required: true,
    },
    isUnknownCommand: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export type ICommand = mongoose.Model<ICommandSchema>;

export const Command: mongoose.Model<ICommandSchema> = mongoose.model(
  "command",
  CommandSchema,
  "Command"
);
