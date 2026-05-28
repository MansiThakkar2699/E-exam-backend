const express = require("express");
const router = express.Router();
const {
  validateToken,
  authorizeRoles,
} = require("../middleware/AuthMiddleware");

const {
  registerUser,
  loginUser,
  getProfile,
  approveUser,
  updateAccountStatus
} = require("../controllers/AuthController");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected profile API
router.get("/profile", validateToken, getProfile);

router.put("/approve/:id", validateToken, authorizeRoles("admin"), approveUser);

router.put("/block/:id", validateToken, authorizeRoles("admin"), updateAccountStatus);

module.exports = router;
