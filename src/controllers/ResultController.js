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

    const questionIds = answers.map((item) => item.questionId);

    const questions = await Question.find({
      _id: { $in: questionIds },
    });

    let obtainedMarks = 0;

    let correctAnswers = 0;

    let wrongAnswers = 0;

    const evaluatedAnswers = [];

    questions.forEach((question) => {
      const studentAnswer = answers.find(
        (a) => a.questionId === question._id.toString(),
      );

      const isCorrect =
        studentAnswer?.selectedAnswer === question.correctAnswer;

      if (isCorrect) {
        obtainedMarks += question.marks;

        correctAnswers++;
      } else {
        wrongAnswers++;
      }

      evaluatedAnswers.push({
        questionId: question._id,

        selectedAnswer: studentAnswer?.selectedAnswer,

        correctAnswer: question.correctAnswer,

        isCorrect,

        marksObtained: isCorrect ? question.marks : 0,
      });
    });

    const percentage = (obtainedMarks / exam.totalMarks) * 100;

    const resultStatus = obtainedMarks >= exam.passingMarks ? "pass" : "fail";

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
      message: "Exam submitted successfully",

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
const getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({
      student: req.user.id,
    })
      .populate({
        path: "exam",
        populate: {
          path: "subject",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Results fetched successfully",
      results,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};

const getStudentPerformance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const results = await Result.find({
      student: studentId,
    });

    const totalExams = results.length;

    const passedExams = results.filter((r) => r.resultStatus === "pass").length;

    const failedExams = results.filter((r) => r.resultStatus === "fail").length;

    const averageScore =
      totalExams > 0
        ? (
            results.reduce((sum, result) => sum + result.percentage, 0) /
            totalExams
          ).toFixed(2)
        : 0;

    res.status(200).json({
      totalExams,
      passedExams,
      failedExams,
      averageScore,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFacultyPerformance = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const exams = await Exam.find({
      createdBy: facultyId,
    });

    const examIds = exams.map((exam) => exam._id);

    const results = await Result.find({
      exam: {
        $in: examIds,
      },
    });

    const totalStudents = results.length;

    const passedStudents = results.filter(
      (result) => result.resultStatus === "pass",
    ).length;

    const passPercentage =
      totalStudents > 0
        ? ((passedStudents / totalStudents) * 100).toFixed(2)
        : 0;

    const averageScore =
      totalStudents > 0
        ? (
            results.reduce((sum, result) => sum + result.percentage, 0) /
            totalStudents
          ).toFixed(2)
        : 0;

    res.status(200).json({
      totalExams: exams.length,
      totalStudents,
      passPercentage,
      averageScore,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFacultyResults = async (req, res) => {
  try {
    const exams = await Exam.find({
      createdBy: req.user.id,
    });

    const examIds = exams.map((exam) => exam._id);

    const results = await Result.find({
      exam: {
        $in: examIds,
      },
    })
      .populate("student", "fullName email")
      .populate("exam", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      results,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSubjectWisePerformance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const results = await Result.find({
      student: studentId,
    }).populate({
      path: "exam",
      populate: {
        path: "subject",
      },
    });

    const subjectMap = {};

    results.forEach((result) => {
      const subjectName = result.exam?.subject?.name;

      if (!subjectName) return;

      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          totalPercentage: 0,
          totalExams: 0,
        };
      }

      subjectMap[subjectName].totalPercentage += result.percentage;
      subjectMap[subjectName].totalExams += 1;
    });

    const chartData = Object.keys(subjectMap).map((subject) => ({
      subject,
      averagePercentage: Number(
        (
          subjectMap[subject].totalPercentage / subjectMap[subject].totalExams
        ).toFixed(2),
      ),
    }));

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultId)
      .populate("student", "fullName email")
      .populate("exam", "title totalMarks passingMarks")
      .populate("answers.questionId", "question options questionType marks");

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    if (
      req.user.role === "student" &&
      result.student._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    res.status(200).json({
      message: "Result fetched successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch result",
      error: error.message,
    });
  }
};

module.exports = {
  submitExam,
  getStudentResults,
  getStudentPerformance,
  getFacultyPerformance,
  getFacultyResults,
  getSubjectWisePerformance,
  getResultById,
};
