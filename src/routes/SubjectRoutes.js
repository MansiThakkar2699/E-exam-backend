const express = require("express");
const router = express.Router();

const {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} = require("../controllers/SubjectController");

const {
  validateToken, authorizeRoles
} = require("../middleware/AuthMiddleware");

// Only admin can create/update/delete subjects
router.post("/subjects", validateToken, authorizeRoles("admin"), createSubject);

router.get("/subjects", validateToken, getSubjects);

router.put("/subjects/:id", validateToken, authorizeRoles("admin"), updateSubject);

router.delete("/subjects/:id", validateToken, authorizeRoles("admin"), deleteSubject);

module.exports = router;