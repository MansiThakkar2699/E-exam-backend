const Subject = require("../models/SubjectModel");

// CREATE SUBJECT
const createSubject = async (req, res) => {
  try {
    const { name, code, department } = req.body;

    if (!name || !code || !department) {
      return res.status(400).json({
        message: "Name, code and department are required",
      });
    }

    const existingSubject = await Subject.findOne({ code });

    if (existingSubject) {
      return res.status(400).json({
        message: "Subject code already exists",
      });
    }

    const subject = await Subject.create({
      name,
      code,
      department,
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

// GET ALL SUBJECTS
const getAllSubjects = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const totalSubjects = await Subject.countDocuments({
      status: { $ne: "deleted" }
    });
    const subjects = await Subject.find({ status: { $ne: "deleted" } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
      currentPage: page,
      totalPages: Math.ceil(totalSubjects / limit),
      totalSubjects
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }
};

// GET SINGLE SUBJECT
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject || subject.status === "deleted") {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject fetched successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subject",
      error: error.message,
    });
  }
};

// UPDATE SUBJECT
const updateSubject = async (req, res) => {
  try {
    const { name, code, department, status } = req.body;

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code,
        department,
        status,
      },
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

// DELETE SUBJECT - SOFT DELETE
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { status: "deleted" },
      { new: true },
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully",
      subject,
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
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
