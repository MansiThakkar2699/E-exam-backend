const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exams",
      required: true,
    },

    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "questions",
        },

        selectedAnswer: String,

        correctAnswer: String,

        isCorrect: Boolean,

        marksObtained: Number,
      },
    ],

    totalQuestions: Number,

    correctAnswers: Number,

    wrongAnswers: Number,

    totalMarks: Number,

    obtainedMarks: Number,

    percentage: Number,

    resultStatus: {
      type: String,
      enum: ["pass", "fail"],
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "results",
  resultSchema
);