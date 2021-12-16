import mongoose from "mongoose";
const { Schema } = mongoose;

export const CommandSchema = new Schema(
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

export const Command = mongoose.model("command", CommandSchema, "Command");
