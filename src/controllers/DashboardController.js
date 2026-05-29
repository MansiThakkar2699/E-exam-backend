const User = require("../models/UserModel");

const Exam = require("../models/ExamModel");

const Question = require("../models/QuestionModel");

const Department = require("../models/DepartmentModel");

// ADMIN DASHBOARD
const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({
      role: "student",
      isDeleted: false,
    });

    const totalFaculties = await User.countDocuments({
      role: "faculty",
      isDeleted: false,
    });

    const totalExams = await Exam.countDocuments({
      status: { $ne: "deleted" },
    });

    const totalDepartments = await Department.countDocuments({
      isDeleted: false,
    });

    const pendingApprovals = await User.countDocuments({
      approvalStatus: "pending",
      isDeleted: false,
    });

    const recentUsers = await User.find({
      isDeleted: false,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .select("fullName email role");

    const upcomingExams = await Exam.find({
      status: { $ne: "deleted" },
    })
      .populate("subject")
      .sort({
        examDate: 1,
      })
      .limit(5);

    res.status(200).json({
      message: "Admin dashboard fetched successfully",

      analytics: {
        totalStudents,
        totalFaculties,
        totalExams,
        totalDepartments,
        pendingApprovals,
      },

      recentUsers,
      upcomingExams,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

// FACULTY DASHBOARD
const getFacultyDashboard = async (req, res) => {
  try {
    const myExams = await Exam.countDocuments({
      createdBy: req.user._id,
      status: { $ne: "deleted" },
    });

    const activeExams = await Exam.countDocuments({
      createdBy: req.user._id,
      status: "active",
    });

    const myQuestions = await Question.countDocuments({
      createdBy: req.user._id,
      status: { $ne: "deleted" },
    });

    const recentExams = await Exam.find({
      createdBy: req.user._id,
      status: { $ne: "deleted" },
    })
      .populate("subject")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      message: "Faculty dashboard fetched successfully",

      analytics: {
        myExams,
        activeExams,
        myQuestions,
      },

      recentExams,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
  getFacultyDashboard,
};
