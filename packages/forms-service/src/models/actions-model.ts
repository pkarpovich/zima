import mongoose from "mongoose";
import { IPropSchema, PropSchema } from "./props-model.js";

const { Schema } = mongoose;

export interface IActionSchema {
  keywords: string[];
  actionType: string;
  props?: IPropSchema[];
}

export const ActionSchema: mongoose.Schema<IActionSchema> = new Schema({
  keywords: {
    type: [String],
    default: [],
  },
  actionType: {
    type: String,
    required: true,
  },
  props: {
    type: [PropSchema],
    default: [],
  },
});
