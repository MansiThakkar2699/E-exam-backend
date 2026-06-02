const Exam = require("../models/ExamModel");
const Subject = require("../models/SubjectModel");
const User = require("../models/UserModel");

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

    // FACULTY
    // if (req.user.role === "faculty") {
    //   const subjects = await Subject.find({
    //     faculty: req.user._id,
    //   }).select("_id");

    //   filter.subject = {
    //     $in: subjects.map((s) => s._id),
    //   };
    // }

    // STUDENT
    // if (req.user.role === "student") {
    //   const subjects = await Subject.find({
    //     department: req.user.department,
    //   }).select("_id");

    //   filter.subject = {
    //     $in: subjects.map((s) => s._id),
    //   };
    // }


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

    const updatedExams = exams.map((exam) => ({
      ...exam.toObject(),
      examStatus: getExamStatus(exam),
    }));

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

    const subjectIds = subjects.map(
      (subject) => subject._id
    );

    const exams = await Exam.find({
      subject: {
        $in: subjectIds,
      },
      status: "active",
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

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  getStudentExams
};
