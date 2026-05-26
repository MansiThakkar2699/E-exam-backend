const Question = require("../models/questionModel");


// CREATE QUESTION
const createQuestion = async (req, res) => {
  try {
    const {
      exam,
      question,
      options,
      correctAnswer,
      marks,
      questionType,
    } = req.body;

    const newQuestion = await Question.create({
      exam,
      question,
      options,
      correctAnswer,
      marks,
      questionType,
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
    const questions = await Question.find({
      status: { $ne: "deleted" },
    })
      .populate("exam")
      .sort({ createdAt: -1 });

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
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update question",
      error: error.message,
    });
  }
};


// DELETE QUESTION
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { status: "deleted" },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Question deleted successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete question",
      error: error.message,
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