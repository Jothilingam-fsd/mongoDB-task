import mongoose from "mongoose";

const { Schema, model } = mongoose;

const companyDriveSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    driveDate: {
      type: Date,
      required: true,
      index: true
    },
    appearedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

const CompanyDrive = model("CompanyDrive", companyDriveSchema);

export default CompanyDrive;
