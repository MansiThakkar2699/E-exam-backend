const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/utils/DBConnection");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./src/routes/AuthRoutes")
app.use("/auth", authRoutes);

const subjectRoutes = require("./src/routes/SubjectRoutes")
app.use("/sub", subjectRoutes)

const examRoutes = require("./src/routes/ExamRoutes")
app.use("/exam", examRoutes)

const questionRoutes = require("./src/routes/QuestionRoutes")
app.use("/que", questionRoutes)

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});