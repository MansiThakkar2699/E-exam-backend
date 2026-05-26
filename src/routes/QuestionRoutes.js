const express = require("express");

const router = express.Router();

const {
  createQuestion,
  getAllQuestions,
  getQuestionsByExam,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");

const {
  validateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");


// CREATE
router.post(
  "/questions",
  validateToken,
  authorizeRoles("admin", "faculty"),
  createQuestion
);


// GET ALL
router.get(
  "/questions",
  validateToken,
  getAllQuestions
);


// GET BY EXAM
router.get(
  "/questions/exam/:examId",
  validateToken,
  getQuestionsByExam
);


// UPDATE
router.put(
  "/questions/:id",
  validateToken,
  authorizeRoles("admin", "faculty"),
  updateQuestion
);


// DELETE
router.delete(
  "/questions/:id",
  validateToken,
  authorizeRoles("admin", "faculty"),
  deleteQuestion
);

module.exports = router;