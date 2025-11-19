import mongoose from "mongoose";

const { Schema, model } = mongoose;

const problemDetailSchema = new Schema(
  {
    problemId: {
      type: String,
      required: true,
      trim: true
    },
    solvedDate: {
      type: Date,
      required: true
    }
  },
  { _id: false }
);

const codekataSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    problemsSolved: {
      type: Number,
      default: 0,
      min: 0
    },
    problemDetails: [problemDetailSchema]
  },
  { timestamps: true }
);

const Codekata = model("Codekata", codekataSchema);

export default Codekata;
