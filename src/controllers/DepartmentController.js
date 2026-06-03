const Department = require("../models/DepartmentModel");

// CREATE
const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const existingDepartment = await Department.findOne({
      $or: [{ name }, { code }],
      isDeleted: false,
    });

    if (existingDepartment) {
      return res.status(400).json({
        message: "Department already exists",
      });
    }

    const department = await Department.create({
      name,
      code,
      description,
    });

    res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create department",
      error: error.message,
    });
  }
};

const getDepartments = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,

      name: {
        $regex: search,
        $options: "i",
      },
    };

    const totalDepartments = await Department.countDocuments(filter);

    const departments = await Department.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      departments,

      currentPage: page,

      totalPages: Math.ceil(totalDepartments / limit) || 1,

      totalDepartments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.status(200).json({
      message: "Department updated successfully",

      department,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update department",
      error: error.message,
    });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
      },
      { new: true },
    );

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.status(200).json({
      message: "Department deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete department",
      error: error.message,
    });
  }
};

// GET ACTIVE DEPARTMENTS FOR DROPDOWN
const getDepartmentOptions = async (req, res) => {
  try {
    const departments = await Department.find({
      isDeleted: false,
      status: "active",
    })
      .select("name")
      .sort({ name: 1 });

    res.status(200).json({
      departments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  getDepartmentOptions
};
