import mongoose from "mongoose";
import { FormTypes } from "shared/enums";
import { ActionSchema, IActionSchema } from "./actions-model.js";

const { Schema } = mongoose;

export interface IFormSchema {
  name: string;
  globalKeywords: string[];
  actions: IActionSchema[];
  type?: string;
  queueName: string;
}

export const FormSchema: mongoose.Schema<IFormSchema> = new Schema({
  name: {
    type: String,
    required: true,
  },
  globalKeywords: {
    type: [String],
    default: [],
  },
  actions: {
    type: [ActionSchema],
  },
  type: {
    type: String,
    default: FormTypes.User,
  },
  queueName: {
    type: String,
    required: true,
  },
});

export type IForm = mongoose.Model<IFormSchema>;

export const Form: IForm = mongoose.model("form", FormSchema, "Form");
