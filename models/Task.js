import mongoose from "mongoose";

const { Schema, model } = mongoose;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    assignedDate: {
      type: Date,
      required: true,
      index: true
    },
    submissionDate: {
      type: Date,
      required: false
    },
    submittedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    status: {
      type: String,
      enum: ["pending", "submitted"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const Task = model("Task", taskSchema);

export default Task;
