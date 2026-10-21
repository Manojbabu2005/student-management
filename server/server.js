
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: [
        'https://student-management-vert-tau.vercel.app/', // Replace with your exact Vercel URL
        'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express.json());

const studentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        rollNo: { type: String, required: true, unique: true, trim: true },
        department: { type: String, required: true },
        email: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

app.get("/", (req, res) => {
    res.json({ message: "Student Management API is running" });
});

// View all students
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch students" });
    }
});

// Add a student
app.post("/api/students", async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(error.code === 11000 ? 409 : 400).json({
            message:
                error.code === 11000
                    ? "Roll number already exists"
                    : error.message,
        });
    }
});

// Update a student
app.put("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(student);
    } catch (error) {
        res.status(error.code === 11000 ? 409 : 400).json({
            message:
                error.code === 11000
                    ? "Roll number already exists"
                    : error.message,
        });
    }
});

// Delete a student
app.delete("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Invalid student ID" });
    }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
