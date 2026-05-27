const express = require("express");

const router = express.Router();

const {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
} = require("../controllers/ExamController");

const {
  validateToken,
  authorizeRoles,
} = require("../middleware/AuthMiddleware");


// CREATE
router.post(
  "/exams",
  validateToken,
  authorizeRoles("admin", "faculty"),
  createExam
);


// GET ALL
router.get("/exams", validateToken, getAllExams);


// GET SINGLE
router.get("/exams/:id", validateToken, getExamById);


// UPDATE
router.put(
  "/exams/:id",
  validateToken,
  authorizeRoles("admin", "faculty"),
  updateExam
);


// DELETE
router.delete(
  "/exams/:id",
  validateToken,
  authorizeRoles("admin", "faculty"),
  deleteExam
);

module.exports = router;