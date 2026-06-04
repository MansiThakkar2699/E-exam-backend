const Exam = require("../models/ExamModel");
const Subject = require("../models/SubjectModel");
const User = require("../models/UserModel");
const Question = require("../models/QuestionModel");

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
      startTime,
      endTime,
    } = req.body;

    const exam = await Exam.create({
      title,
      subject,
      description,
      duration,
      totalMarks,
      passingMarks,
      startTime,
      endTime,
      createdBy: req.user.id,
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

const getExamStatus = (exam) => {
  const now = new Date();

  if (now < new Date(exam.startTime)) {
    return "upcoming";
  }

  if (now >= new Date(exam.startTime) && now <= new Date(exam.endTime)) {
    return "live";
  }

  return "completed";
};

// GET ALL EXAMS
const getAllExams = async (req, res) => {
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

    const totalExams = await Exam.countDocuments(filter);

    const exams = await Exam.find(filter)
      .populate("subject")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const updatedExams = exams.map((exam) => {
      const diffInMs =
        new Date(exam.startTime) - new Date();

      return {
        ...exam.toObject(),
        canUnpublish:
          exam.publishStatus === "published" &&
          diffInMs > 60 * 60 * 1000,

        examStatus: getExamStatus(exam),
      };
    });

    res.status(200).json({
      message: "Exams fetched successfully",
      exams: updatedExams,
      currentPage: page,
      totalPages: Math.ceil(totalExams / limit) || 1,
      totalExams,
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

    const now = new Date();

    if (now < exam.startTime) {
      return res.status(400).json({
        message: "Exam has not started yet",
      });
    }

    if (now > exam.endTime) {
      return res.status(400).json({
        message: "Exam has already ended",
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

const getStudentExams = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    const subjects = await Subject.find({
      department: student.department,
      status: "active",
    });

    const subjectIds = subjects.map((subject) => subject._id);

    const exams = await Exam.find({
      subject: {
        $in: subjectIds,
      },
      status: "active",
      publishStatus: "published",
    })
      .populate("subject")
      .sort({ startTime: 1 });

    const examsWithStatus = exams.map((exam) => ({
      ...exam.toObject(),
      examStatus: getExamStatus(exam),
    }));

    res.status(200).json({
      exams: examsWithStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch exams",
      error: error.message,
    });
  }
};

const publishExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    // EXAM DELETED
    if (exam.status === "deleted") {
      return res.status(400).json({
        message: "Cannot publish a deleted exam",
      });
    }

    // ALREADY PUBLISHED
    if (exam.publishStatus === "published") {
      return res.status(400).json({
        message: "Exam is already published",
      });
    }

    // EXAM DATE VALIDATION
    if (new Date(exam.examDate) <= new Date()) {
      return res.status(400).json({
        message: "Exam date must be in the future",
      });
    }

    // MINIMUM 5 QUESTIONS REQUIRED
    const questionCount = await Question.countDocuments({
      exam: exam._id,
      status: "active",
    });

    if (questionCount < 5) {
      return res.status(400).json({
        message: "At least 5 questions are required to publish an exam",
      });
    }

    exam.publishStatus = "published";

    await exam.save();

    res.status(200).json({
      message: "Exam published successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const unpublishExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    // Must be published
    if (exam.publishStatus !== "published") {
      return res.status(400).json({
        message: "Only published exams can be unpublished",
      });
    }

    // ⛔ TIME RESTRICTION LOGIC
    const now = new Date();
    const examStart = new Date(exam.startTime);

    const diffInMs = examStart - now;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    // ❌ If exam is within 1 hour, block unpublish
    if (diffInHours <= 1) {
      return res.status(400).json({
        message: "Cannot unpublish exam within 1 hour of exam start time",
      });
    }

    // ✅ Allow unpublish
    exam.publishStatus = "draft";

    await exam.save();

    return res.status(200).json({
      message: "Exam moved to draft successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  getStudentExams,
  publishExam,
  unpublishExam,
};
