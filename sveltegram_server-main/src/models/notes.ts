import { model, Schema } from "mongoose";

const noteSchema = new Schema(
  {
    noteId: {
      type: String,
      trim: true,
    },
    isProtected: {
      type: String,
      trim: true,
    },
    title: {
      type: [String],
    },
    type: {
      type: [String],
    },
    tags: {
      type: [String],
    },
    dateModified: {
        type: [String],
    },
    parentNoteIds: {
        type: [String],
    },
    childNoteIds: {
        type: [String],
    },
    parentBranchIds: {
        type: [String],
    },
    childBranchIds: {
        type: [String],
    },
    attributes: {
        type: [String],
    },
  },
);

module.exports = model("Note", noteSchema);


const notebranchSchema = new Schema(
    {
      branchId: {
        type: String,
        trim: true,
      },
      noteId: {
        type: String,
        trim: true,
      },
      parentNoteId: {
        type: [String],
      },
      prefix: {
        type: [String],
      },
      notePosition: {
        type: [String],
      },
      isExpanded: {
          type: [String],
      },
      utcDateModified: {
          type: [String],
      }
    },
);
  
module.exports = model("Branch", notebranchSchema);

const noteattributeSchema = new Schema(
    {
      attributeId: {
        type: String,
        trim: true,
      },
      noteId: {
        type: String,
        trim: true,
      },
      name: {
        type: [String],
      },
      type: {
        type: [String],
      },
      value: {
        type: [String],
      },
      position: {
          type: [String],
      },
      isInheritable: {
          type: [String],
      },
      utcDateModified: {
          type: [String],
      },
    },
);
  
 module.exports = model("Attribute", noteattributeSchema);






