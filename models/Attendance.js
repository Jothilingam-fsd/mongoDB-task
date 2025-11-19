import mongoose from "mongoose";

const { Schema, model } = mongoose;

const attendanceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ["present", "absent"]
    }
  },
  { timestamps: true }
);

const Attendance = model("Attendance", attendanceSchema);

export default Attendance;
