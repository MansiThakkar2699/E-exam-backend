const express = require("express");

const router = express.Router();

const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/DepartmentController");

const {
  validateToken,
  authorizeRoles,
} = require("../middleware/AuthMiddleware");

// CREATE
router.post("/departments", validateToken, authorizeRoles("admin"), createDepartment);

// GET
router.get("/departments", getDepartments);

// UPDATE
router.put("/departments/:id", validateToken, authorizeRoles("admin"), updateDepartment);

// DELETE
router.delete("/departments/:id", validateToken, authorizeRoles("admin"), deleteDepartment);

module.exports = router;
