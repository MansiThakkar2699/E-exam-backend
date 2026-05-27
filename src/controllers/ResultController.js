const Result = require("../models/ResultModel");

const Question = require("../models/QuestionModel");

const Exam = require("../models/ExamModel");


// SUBMIT EXAM
const submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    const questionIds = answers.map(
      (item) => item.questionId
    );

    const questions = await Question.find({
      _id: { $in: questionIds },
    });

    let obtainedMarks = 0;

    let correctAnswers = 0;

    let wrongAnswers = 0;

    const evaluatedAnswers = [];

    questions.forEach((question) => {
      const studentAnswer = answers.find(
        (a) =>
          a.questionId === question._id.toString()
      );

      const isCorrect =
        studentAnswer?.selectedAnswer ===
        question.correctAnswer;

      if (isCorrect) {
        obtainedMarks += question.marks;

        correctAnswers++;
      } else {
        wrongAnswers++;
      }

      evaluatedAnswers.push({
        questionId: question._id,

        selectedAnswer:
          studentAnswer?.selectedAnswer,

        correctAnswer:
          question.correctAnswer,

        isCorrect,

        marksObtained: isCorrect
          ? question.marks
          : 0,
      });
    });

    const percentage =
      (obtainedMarks / exam.totalMarks) * 100;

    const resultStatus =
      obtainedMarks >= exam.passingMarks
        ? "pass"
        : "fail";

    const result = await Result.create({
      student: req.user.id,

      exam: exam._id,

      answers: evaluatedAnswers,

      totalQuestions: questions.length,

      correctAnswers,

      wrongAnswers,

      totalMarks: exam.totalMarks,

      obtainedMarks,

      percentage,

      resultStatus,
    });

    //console.log("res :", res);

    res.status(201).json({
      message:
        "Exam submitted successfully",

      result,
    });
  } catch (error) {
    //console.log(error)
    res.status(500).json({
      message: "Failed to submit exam",
      error: error.message,
    });
  }
};


// GET STUDENT RESULTS
const getStudentResults = async (
  req,
  res
) => {
  try {
    const results = await Result.find({
      student: req.user.id,
    })
      .populate("exam")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message:
        "Results fetched successfully",

      results,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};

module.exports = {
  submitExam,
  getStudentResults,
};