import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Codekata from "./models/Codekata.js";
import Attendance from "./models/Attendance.js";
import Topic from "./models/Topic.js";
import Task from "./models/Task.js";
import CompanyDrive from "./models/CompanyDrive.js";
import Mentor from "./models/Mentor.js";

dotenv.config();

const app = express();
app.use(express.json());

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/zenclassdb";

mongoose.set("strictQuery", false);

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully.");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

/**
 * GET /topics-tasks/october
 * Find all topics and their tasks taught in the month of October (any year).
 */
app.get("/topics-tasks/october", async (req, res) => {
  try {
    // Filter topics where teachingDate is in October (month 9 in JS Date)
    // Tasks are populated
    const octoberTopics = await Topic.find({
      teachingDate: {
        $gte: new Date("2000-10-01T00:00:00.000Z"),
        $lt: new Date("2000-11-01T00:00:00.000Z")
      }
    })
      .populate("tasks")
      .exec();

    // Because we used fixed year 2000 in filtering, this would not work correctly.
    // We need to match only month of October ignoring year.

    // So, better to fetch all topics and filter by month in JS:
    const allTopics = await Topic.find()
      .populate("tasks")
      .exec();

    const octoberTopicsFiltered = allTopics.filter((topic) => {
      if (!topic.teachingDate) return false;
      return topic.teachingDate.getMonth() === 9; // October is month 9
    });

    return res.status(200).json(octoberTopicsFiltered);
  } catch (err) {
    console.error("Error fetching October topics and tasks:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /company-drives/date-range
 * Query Params: startDate, endDate (ISO strings)
 * Fetch all company drives between startDate and endDate inclusive.
 * If no query params, default to 15 Oct 2020 to 31 Oct 2020.
 */
app.get("/company-drives/date-range", async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      startDate = "2020-10-15T00:00:00.000Z";
      endDate = "2020-10-31T23:59:59.999Z";
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const drives = await CompanyDrive.find({
      driveDate: { $gte: start, $lte: end }
    }).exec();

    return res.status(200).json(drives);
  } catch (err) {
    console.error("Error fetching company drives by date range:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /company-drives-with-students
 * Fetch all company drives and the students who appeared for the placement.
 */
app.get("/company-drives-with-students", async (req, res) => {
  try {
    const drives = await CompanyDrive.find()
      .populate({
        path: "appearedStudents",
        select: "name email enrollmentDate"
      })
      .exec();

    return res.status(200).json(drives);
  } catch (err) {
    console.error("Error fetching company drives with students:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /codekata/problems-solved/:userId
 * Return number of problems solved by the user in codekata.
 */
app.get("/codekata/problems-solved/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const codekataRecord = await Codekata.findOne({ user: userId }).exec();

    if (!codekataRecord) {
      return res.status(404).json({ error: "Codekata record not found for user" });
    }

    return res.status(200).json({ userId, problemsSolved: codekataRecord.problemsSolved });
  } catch (err) {
    console.error("Error fetching problems solved by user:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /mentors/with-mentees-count
 * Return all mentors who have mentees count more than 15.
 */
app.get("/mentors/with-mentees-count", async (req, res) => {
  try {
    // Using aggregation to filter mentors with mentees array length > 15
    const mentors = await Mentor.aggregate([
      {
        $project: {
          name: 1,
          email: 1,
          expertise: 1,
          menteesCount: { $size: { $ifNull: ["$mentees", []] } }
        }
      },
      {
        $match: {
          menteesCount: { $gt: 15 }
        }
      }
    ]);

    return res.status(200).json(mentors);
  } catch (err) {
    console.error("Error fetching mentors with mentees count > 15:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /users/absent-no-task
 * Return the number of users who are absent and task is not submitted between 15 Oct 2020 and 31 Oct 2020.
 */
app.get("/users/absent-no-task", async (req, res) => {
  try {
    const start = new Date("2020-10-15T00:00:00.000Z");
    const end = new Date("2020-10-31T23:59:59.999Z");

    // Find attendance records where status is absent between those dates
    const absentAttendances = await Attendance.find({
      status: "absent",
      date: { $gte: start, $lte: end }
    }).select("user").exec();

    if (absentAttendances.length === 0) {
      return res.status(200).json({ count: 0 });
    }

    // Get unique user IDs who were absent in that period
    const absentUserIds = [...new Set(absentAttendances.map((a) => a.user.toString()))];

    // Find tasks that were assigned in the date range
    const tasksInRange = await Task.find({
      assignedDate: { $lte: end },
      $or: [
        { submissionDate: { $gte: start, $lte: end } },
        { submissionDate: null }
      ]
    }).select("_id submittedBy status").exec();

    // We want users who were absent AND did not submit task(s) in that time.
    // For each absent user, check if they submitted any tasks in that period.

    // Build a map of userId => tasks submitted in date range
    const userSubmittedTasks = new Set();

    for (const task of tasksInRange) {
      if (task.submittedBy && task.submittedBy.length > 0) {
        for (const userId of task.submittedBy) {
          const uid = userId.toString();
          if (absentUserIds.includes(uid) && task.status === "submitted") {
            userSubmittedTasks.add(uid);
          }
        }
      }
    }

    // Users who were absent and did NOT submit tasks:
    const absentNoTaskUsers = absentUserIds.filter((uid) => !userSubmittedTasks.has(uid));

    return res.status(200).json({ count: absentNoTaskUsers.length });
  } catch (err) {
    console.error("Error fetching users absent with no task submitted:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Default 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Zen Class API server running on port ${PORT}`);
});
