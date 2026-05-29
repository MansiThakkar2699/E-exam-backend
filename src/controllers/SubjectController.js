const Subject = require("../models/SubjectModel");


// CREATE SUBJECT
const createSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      department,
      faculty,
      description,
      status,
    } = req.body;

    const existingSubject = await Subject.findOne({
      code,
      status: { $ne: "deleted" }
    });

    if (existingSubject) {
      return res.status(400).json({
        message: "Subject code already exists",
      });
    }

    const subject = await Subject.create({
      name,
      code,
      department,
      faculty,
      description,
      status,
    });

    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create subject",
      error: error.message,
    });
  }
};


// GET SUBJECTS
const getSubjects = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = req.query.search || "";

    const department = req.query.department || "";

    const faculty = req.query.faculty || "";

    const skip = (page - 1) * limit;

    let filter = {
      status: { $ne: "deleted" },

      $or: [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          code: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    };

    // FILTER DEPARTMENT
    if (department) {
      filter.department = department;
    }

    // FILTER FACULTY
    if (faculty) {
      filter.faculty = faculty;
    }

    // FACULTY CAN SEE OWN SUBJECTS ONLY
    if (req.user.role === "faculty") {
      filter.faculty = req.user._id;
    }

    const totalSubjects = await Subject.countDocuments(filter);

    const subjects = await Subject.find(filter)
      .populate("department", "name code")
      .populate("faculty", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      subjects,
      currentPage: page,
      totalPages: Math.ceil(totalSubjects / limit) || 1,
      totalSubjects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }
};


// UPDATE SUBJECT
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update subject",
      error: error.message,
    });
  }
};


// DELETE SUBJECT (SOFT DELETE)
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        status: "deleted",
      },
      {
        new: true,
      },
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete subject",
      error: error.message,
    });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
};