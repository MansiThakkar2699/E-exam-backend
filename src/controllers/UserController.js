const User = require("../models/UserModel");

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// UPDATE USER ROLE
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update role",
      error: error.message,
    });
  }
};

// UPDATE STATUS
const updateUserStatus = async (req, res) => {
  try {
    const { accountStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
      },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};
