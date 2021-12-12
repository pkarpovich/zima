import mongoose from "mongoose";
const { Schema } = mongoose;

import { PropSchema } from "./props-model.mjs";

export const ActionSchema = new Schema({
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
