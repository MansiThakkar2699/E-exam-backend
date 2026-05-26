const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exams",
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: [
      {
        type: String,
        required: true,
      },
    ],

    correctAnswer: {
      type: String,
      required: true,
    },

    marks: {
      type: Number,
      default: 1,
    },

    questionType: {
      type: String,
      enum: ["mcq", "truefalse"],
      default: "mcq",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("questions", questionSchema);
