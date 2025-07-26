import { Schema } from "mongoose";
import { mongoDbProvider } from "../mongoDBProvider";
import { IForm } from "../types";

const selectionOptionSchema = new Schema(
  {
    label: String,
    value: String,
  },
  { _id: false }
);

const propsSchema = new Schema(
  {
    label: String,
    fieldKey: String,
    selectionOptions: [selectionOptionSchema],
    left: String,
    right: String,
    range: Number,
    min: Number,
    max: Number,
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    type: { type: String, required: true },
    props: propsSchema,
  },
  { _id: false }
);

const formsScheme = new Schema<IForm>(
  {
    name: { type: String, required: true },
    title: { type: String },
    instructions: { type: String },
    questions: [questionSchema],
  },
  { versionKey: false }
);

export const FormsModel = mongoDbProvider.getModel("forms", formsScheme);
