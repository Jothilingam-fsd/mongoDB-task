import mongoose from "mongoose";

const { Schema, model } = mongoose;

const topicSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    teachingDate: {
      type: Date,
      required: true,
      index: true
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task"
      }
    ]
  },
  { timestamps: true }
);

const Topic = model("Topic", topicSchema);

export default Topic;
