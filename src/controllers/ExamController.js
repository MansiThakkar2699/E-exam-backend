const Exam = require("../models/ExamModel");

// CREATE EXAM
const createExam = async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      duration,
      totalMarks,
      passingMarks,
      examDate,
    } = req.body;

    const exam = await Exam.create({
      title,
      subject,
      description,
      duration,
      totalMarks,
      passingMarks,
      examDate,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create exam",
      error: error.message,
    });
  }
};

// GET ALL EXAMS
const getAllExams = async (req, res) => {
  try {
    let filter = {
      status: { $ne: "deleted" },
    };

    if (req.user.role === "faculty") {
      filter.createdBy = req.user._id;
    }
    const exams = await Exam.find(filter)
      .populate("subject")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Exams fetched successfully",
      exams,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch exams",
      error: error.message,
    });
  }
};

// GET SINGLE EXAM
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("subject");

    if (!exam || exam.status === "deleted") {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.status(200).json({
      message: "Exam fetched successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch exam",
      error: error.message,
    });
  }
};

// UPDATE EXAM
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.status(200).json({
      message: "Exam updated successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update exam",
      error: error.message,
    });
  }
};

// DELETE EXAM
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: "deleted" },
      { new: true },
    );

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.status(200).json({
      message: "Exam deleted successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete exam",
      error: error.message,
    });
  }
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
};
