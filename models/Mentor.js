import mongoose from "mongoose";

const { Schema, model } = mongoose;

const mentorSchema = new Schema(
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
    expertise: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200
    },
    mentees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

// Unique index on email
mentorSchema.index({ email: 1 }, { unique: true });

const Mentor = model("Mentor", mentorSchema);

export default Mentor;
