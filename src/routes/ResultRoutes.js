const express = require("express");

const router = express.Router();

const {
  submitExam,
  getStudentResults,
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

module.exports = router;