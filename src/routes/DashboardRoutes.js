const express = require("express");

const router = express.Router();

const {
  getAdminDashboard,
  getFacultyDashboard,
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

module.exports = router;