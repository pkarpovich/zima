import mongoose from "mongoose";
const { Schema } = mongoose;

import { ActionSchema } from "./actions-model.mjs";

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
  queueName: {
    type: String,
    required: true,
  },
});

export const Form = mongoose.model("form", FormSchema, "Form");
