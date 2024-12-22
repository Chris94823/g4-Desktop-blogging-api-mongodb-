require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
	.connect(process.env.MONGO_URI, {
		serverSelectionTimeoutMS: 5000,
	})
	.then(() => console.log("Connected to MongoDB using Mongoose"))
	.catch((err) => console.error("Failed to connect to MongoDB:", err));

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.get("/", (req, res) => {
	res.status(200).json({ message: "Welcome to the Blogging API!" });
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
