const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

// Generate student/faculty unique ID
const generateUniqueId = (role) => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);

  if (role === "student") {
    return `STU${year}${random}`;
  }

  if (role === "faculty") {
    return `FAC${year}${random}`;
  }

  return null;
};

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, department, mobile } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let studentId = null;
    let facultyId = null;

    if (role === "student" || !role) {
      studentId = generateUniqueId("student");
    }

    if (role === "faculty") {
      facultyId = generateUniqueId("faculty");
    }

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "student",
      studentId,
      facultyId,
      department,
      mobile,
      status: "active",
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        facultyId: user.facultyId,
        department: user.department,
        mobile: user.mobile,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Invalid email or password",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account is blocked. Please contact admin.",
      });
    }

    if (user.status === "deleted") {
      return res.status(403).json({
        message: "Your account is deleted.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        facultyId: user.facultyId,
        department: user.department,
        mobile: user.mobile,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile
};