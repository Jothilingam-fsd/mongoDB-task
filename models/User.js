import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
      match:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/
    },
    enrollmentDate: {
      type: Date,
      required: true
    },
    mentor: {
      type: Schema.Types.ObjectId,
      ref: "Mentor",
      required: false,
      index: true
    },
    tasksSubmitted: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task"
      }
    ],
    attendanceRecords: [
      {
        type: Schema.Types.ObjectId,
        ref: "Attendance"
      }
    ],
    codekataRecord: {
      type: Schema.Types.ObjectId,
      ref: "Codekata"
    },
    placementStatus: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mentor: 1 });

const User = model("User", userSchema);

export default User;
