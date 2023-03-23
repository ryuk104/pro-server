import { model, Schema } from "mongoose";

const noteSchema = new Schema(
  {
    Id: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    created_by: {
      type: [String],
    },
    last_edited_time: {
      type: [String],
    },
    last_edited_by	: {
        type: [String],
    },
    archived: {
        type: [String],
    },
    icon: {
        type: [String],
    },
    cover: {
        type: [String],
    },
    properties: {
        type: [String],
    },
    parent: {
        type: [String],
    },
  },
);

module.exports = model("Note", noteSchema);
