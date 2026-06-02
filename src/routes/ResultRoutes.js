const express = require("express");

const router = express.Router();

const {
  submitExam,
  getStudentResults,
  getStudentPerformance,
  getFacultyPerformance,
  getFacultyResults
} = require("../controllers/ResultController");

const {
  validateToken,
  authorizeRoles,
} = require("../middleware/AuthMiddleware");


// SUBMIT EXAM
router.post(
  "/submit",
  validateToken,
  authorizeRoles("student"),
  submitExam
);


// GET RESULTS
router.get(
  "/student",
  validateToken,
  authorizeRoles("student"),
  getStudentResults
);

router.get(
  "/my-performance",
  validateToken,
  authorizeRoles("student"),
  getStudentPerformance
);

router.get(
  "/faculty-performance",
  validateToken,
  authorizeRoles("faculty"),
  getFacultyPerformance
);

router.get(
  "/faculty-summary",
  validateToken,
  authorizeRoles("faculty"),
  getFacultyResults
);

module.exports = router;