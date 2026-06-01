const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const crypto = require("crypto");
const sendEmail = require("../utils/SendEmail");

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
      approvalStatus: role === "admin" ? "approved" : "pending",
      accountStatus: "active",
      isDeleted: false,
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

    const user = await User.findOne({ email }).populate("department");

    if (!user) {
      return res.status(404).json({
        message: "Invalid email or password",
      });
    }

    // CHECK DELETED
    if (user.isDeleted) {
      return res.status(403).json({
        message: "Your account has been deleted",
      });
    }

    // CHECK APPROVAL
    if (user.approvalStatus === "pending") {
      return res.status(403).json({
        message: "Your account is waiting for admin approval",
      });
    }

    // CHECK BLOCKED
    if (user.accountStatus === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked by admin",
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
      { expiresIn: "7d" },
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
        approvalStatus: user.approvalStatus,
        accountStatus: user.accountStatus,
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

const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "approved",
      },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User approved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve user",
      error: error.message,
    });
  }
};

const updateAccountStatus = async (req, res) => {
  try {
    const { accountStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus },
      { new: true },
    ).select("-password");

    res.status(200).json({
      message: "Account status updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update account status",
      error: error.message,
    });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change password",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // GENERATE TOKEN
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    // RESET URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // EMAIL TEMPLATE
    const message = `
      <div style="font-family:sans-serif">
        <h2>E-Exam Portal Password Reset</h2>

        <p>Click below button to reset password:</p>

        <a 
          href="${resetUrl}" 
          style="
            display:inline-block;
            padding:12px 20px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            border-radius:8px;
          "
        >
          Reset Password
        </a>

        <p>This link expires in 15 minutes.</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.status(200).json({
      message: "Reset password link sent to email",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send reset email",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    // HASH TOKEN
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // FIND USER
    const user = await User.findOne({
      resetPasswordToken: hashedToken,

      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;

    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  approveUser,
  updateAccountStatus,
  changePassword,
  forgotPassword,
  resetPassword,
};
