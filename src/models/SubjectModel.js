const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    department: {
      type: mongoose.Types.ObjectId,
      ref: "departments",
      required: true,
    },

    faculty: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("subjects", subjectSchema);
