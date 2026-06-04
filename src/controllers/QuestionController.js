const Question = require("../models/QuestionModel");
const Exam = require("../models/ExamModel");

// CREATE QUESTION
const createQuestion = async (req, res) => {
  try {
    const { exam, question, options, correctAnswer, marks, questionType } =
      req.body;

    const examData = await Exam.findById(exam);

    if (examData.publishStatus === "published") {
      return res.status(400).json({
        message: "Published exam cannot be modified",
      });
    }

    const newQuestion = await Question.create({
      exam,
      question,
      options,
      correctAnswer,
      marks,
      questionType,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create question",
      error: error.message,
    });
  }
};

// GET ALL QUESTIONS
const getAllQuestions = async (req, res) => {
  try {
    let filter = {
      status: { $ne: "deleted" },
    };

    if (req.user.role === "faculty") {
      filter.createdBy = req.user.id;
    }

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const totalQuestions = await Question.countDocuments(filter);

    const questions = await Question.find(filter)
      .populate("exam")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Questions fetched successfully",
      questions,
      currentPage: page,
      totalPages: Math.ceil(totalQuestions / limit),
      totalQuestions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};

// GET QUESTIONS BY EXAM
const getQuestionsByExam = async (req, res) => {
  try {
    const questions = await Question.find({
      exam: req.params.examId,
      status: "active",
    });

    res.status(200).json({
      message: "Questions fetched successfully",
      questions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};

// UPDATE QUESTION
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    // GET EXAM
    const exam = await Exam.findById(question.exam);

    if (exam.publishStatus === "published") {
      return res.status(400).json({
        message: "Published exam cannot be modified",
      });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE QUESTION
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    // GET EXAM
    const exam = await Exam.findById(question.exam);

    if (exam.publishStatus === "published") {
      return res.status(400).json({
        message: "Published exam cannot be modified",
      });
    }

     const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { status: "deleted" },
      { new: true },
    );

    res.status(200).json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionsByExam,
  updateQuestion,
  deleteQuestion,
};
