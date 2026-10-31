require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

// =====================
// Student Schema
// =====================
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rollNo: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  }
});

const Student = mongoose.model("Student", studentSchema);

// =====================
// Home Route
// =====================
app.get("/", (req, res) => {
  res.send("Student Record Management API Running");
});

// =====================
// GET ALL STUDENTS
// =====================
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// ADD STUDENT
// =====================
app.post("/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// GET STUDENT BY ROLL NO
// =====================
app.get("/students/:rollNo", async (req, res) => {
  try {
    const student = await Student.findOne({
      rollNo: req.params.rollNo
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// UPDATE STUDENT
// =====================
app.put("/students/:rollNo", async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { rollNo: req.params.rollNo },
      req.body,
      {
        new: true
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student updated successfully",
      student
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// DELETE STUDENT
// =====================
app.delete("/students/:rollNo", async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({
      rollNo: req.params.rollNo
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// DEPARTMENT ANALYTICS
// =====================
app.get("/analytics/department-average", async (req, res) => {
  try {
    const result = await Student.aggregate([
      {
        $group: {
          _id: "$department",
          totalStudents: { $sum: 1 }
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// TOP STUDENTS
// =====================
app.get("/analytics/top-students", async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ semester: -1 })
      .limit(3);

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// MongoDB Connection
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected successfully");

    app.listen(process.env.PORT || 3000, () => {
      console.log(
        `✅ Server running on port ${process.env.PORT || 3000}`
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
  