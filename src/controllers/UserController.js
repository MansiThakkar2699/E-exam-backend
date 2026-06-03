const User = require("../models/UserModel");

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = req.query.search || "";
    const role = req.query.role || "all";

    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,
    };

    if (search) {
      filter.$or = [
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (role !== "all") {
      filter.role = role;
    }

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password")
      .populate("department");

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
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

const getFaculties = async (req, res) => {
  try {
    const faculties = await User.find({
      role: "faculty",
      isDeleted: false,
      accountStatus: "active",
      approvalStatus: "approved",
    }).select("fullName email");

    res.status(200).json({
      faculties,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch faculties",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getFaculties,
};
