const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getFaculties
} = require("../controllers/UserController");

const {
  validateToken,
  authorizeRoles,
} = require("../middleware/AuthMiddleware");


// GET USERS
router.get(
  "/users",
  validateToken,
  authorizeRoles("admin"),
  getAllUsers
);


// UPDATE ROLE
router.put(
  "/users/role/:id",
  validateToken,
  authorizeRoles("admin"),
  updateUserRole
);


// UPDATE STATUS
router.put(
  "/users/accountStatus/:id",
  validateToken,
  authorizeRoles("admin"),
  updateUserStatus
);


// DELETE
router.delete(
  "/users/:id",
  validateToken,
  authorizeRoles("admin"),
  deleteUser
);

router.get(
  "/faculties",
  validateToken,
  getFaculties,
);

module.exports = router;