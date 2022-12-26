import mongoose from "mongoose";
const { Schema } = mongoose;

import { ActionSchema } from "./actions-model.mjs";
import { FormTypes } from "shared/src/form-types.ts";

export const FormSchema = new Schema({
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

export const Form = mongoose.model("form", FormSchema, "Form");
