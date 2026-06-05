const express = require("express");

const router = express.Router();

const {
  getAdminDashboard,
  getFacultyDashboard,
  getStudentDashboardSummary,
  getUpcomingExams,
  getRecentResults,
  getPerformanceChart
} = require("../controllers/DashboardController");

const {
  validateToken,
  authorizeRoles,
} = require("../middleware/AuthMiddleware");


// ADMIN
router.get(
  "/admin",
  validateToken,
  authorizeRoles("admin"),
  getAdminDashboard
);


// FACULTY
router.get(
  "/faculty",
  validateToken,
  authorizeRoles("faculty"),
  getFacultyDashboard
);

router.get(
  "/dashboard-summary",
  validateToken,
  authorizeRoles("student"),
  getStudentDashboardSummary
);

router.get(
  "/upcoming-exams",
  validateToken,
  authorizeRoles("student"),
  getUpcomingExams
);

router.get(
  "/recent-results",
  validateToken,
  authorizeRoles("student"),
  getRecentResults
);

router.get(
  "/performance-chart",
  validateToken,
  authorizeRoles("student"),
  getPerformanceChart
);

module.exports = router;