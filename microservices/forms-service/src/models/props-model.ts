import mongoose from "mongoose";

const { Schema } = mongoose;

export interface IPropSchema {
  name: string;
  type: string;
  clarifyingQuestion: string;
}

export const PropSchema: mongoose.Schema<IPropSchema> = new Schema({
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
