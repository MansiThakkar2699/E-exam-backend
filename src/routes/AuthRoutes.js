const express = require("express");
const router = express.Router();
const { validateToken, authorizeRoles } = require("../middleware/AuthMiddleware")

const {
    registerUser,
    loginUser,
    getProfile
} = require("../controllers/AuthController");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected profile API
router.get("/profile", validateToken, getProfile);

// Role testing APIs
router.get("/admin-dashboard", validateToken, authorizeRoles("admin"), (req, res) => {
    res.json({
        message: "Welcome Admin Dashboard",
        user: req.user,
    });
});

router.get(
    "/faculty-dashboard",
    validateToken,
    authorizeRoles("faculty"),
    (req, res) => {
        res.json({
            message: "Welcome Faculty Dashboard",
            user: req.user,
        });
    }
);

router.get(
    "/student-dashboard",
    validateToken,
    authorizeRoles("student"),
    (req, res) => {
        res.json({
            message: "Welcome Student Dashboard",
            user: req.user,
        });
    }
);

module.exports = router;