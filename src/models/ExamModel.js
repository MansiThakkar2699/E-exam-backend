const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: mongoose.Types.ObjectId,
      ref: "subjects",
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    totalMarks: {
      type: Number,
      required: true,
    },

    passingMarks: {
      type: Number,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("exams", examSchema);