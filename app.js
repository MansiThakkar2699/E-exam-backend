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

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});