import mongoose from "mongoose";
const { Schema } = mongoose;

export const PropSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  clarifyingQuestion: {
    type: String,
    required: true,
  },
});
