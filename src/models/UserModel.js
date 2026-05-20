const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "faculty", "student"],
      default: "student",
    },

    studentId: {
      type: String,
      default: null,
    },

    facultyId: {
      type: String,
      default: null,
    },

    department: {
      type: String,
      default: null,
    },

    mobile: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "pending", "blocked", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);