const express = require("express");
const router = express.Router();

const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");

const {
  validateToken, authorizeRoles
} = require("../middleware/authMiddleware");

// Only admin can create/update/delete subjects
router.post("/subjects", validateToken, authorizeRoles("admin"), createSubject);

router.get("/subjects", validateToken, getAllSubjects);

router.get("/subjects/:id", validateToken, getSubjectById);

router.put("/subjects/:id", validateToken, authorizeRoles("admin"), updateSubject);

router.delete("/subjects/:id", validateToken, authorizeRoles("admin"), deleteSubject);

module.exports = router;