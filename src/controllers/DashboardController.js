const User = require("../models/UserModel");

const Exam = require("../models/ExamModel");

const Question = require("../models/QuestionModel");

const Department = require("../models/DepartmentModel");

const Result = require("../models/ResultModel");

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
      createdBy: req.user.id,
      status: { $ne: "deleted" },
    });

    const activeExams = await Exam.countDocuments({
      createdBy: req.user.id,
      status: "active",
    });

    const myQuestions = await Question.countDocuments({
      createdBy: req.user.id,
      status: { $ne: "deleted" },
    });

    const recentExams = await Exam.find({
      createdBy: req.user.id,
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

const getStudentDashboardSummary = async (req, res) => {
  try {
    const studentId = req.user.id;

    const completedExams = await Result.countDocuments({
      student: studentId,
    });

    const passedExams = await Result.countDocuments({
      student: studentId,
      resultStatus: "pass",
    });

    const results = await Result.find({
      student: studentId,
    });

    const averagePercentage =
      results.length > 0
        ? (
            results.reduce(
              (sum, item) => sum + item.percentage,
              0
            ) / results.length
          ).toFixed(2)
        : 0;

    const attemptedExamIds = results.map(
      (r) => r.exam.toString()
    );

    const availableExams = await Exam.countDocuments({
      publishStatus: "published",
      status: "active",
      _id: {
        $nin: attemptedExamIds,
      },
    });

    res.status(200).json({
      availableExams,
      completedExams,
      passedExams,
      averagePercentage,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getUpcomingExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      publishStatus: "published",
      status: "active",
      examDate: {
        $gt: new Date(),
      },
    })
      .populate("subject")
      .sort({
        examDate: 1,
      })
      .limit(5);

    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getRecentResults = async (req, res) => {
  try {
    const results = await Result.find({
      student: req.user.id,
    })
      .populate("exam")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPerformanceChart = async (req, res) => {
  try {
    const results = await Result.find({
      student: req.user.id,
    })
      .populate("exam")
      .sort({
        createdAt: 1,
      });

    const chartData = results.map((result) => ({
      exam: result.exam.title,
      percentage: result.percentage,
    }));

    res.status(200).json(chartData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
  getFacultyDashboard,
  getStudentDashboardSummary,
  getUpcomingExams,
  getRecentResults,
  getPerformanceChart
};
