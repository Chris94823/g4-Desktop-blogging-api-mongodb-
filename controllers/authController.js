const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createUser = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty())
		return res.status(400).json({ errors: errors.array() });

	try {
		const { email, password, first_name, last_name } = req.body;
		const user = new User({ email, password, first_name, last_name });
		await user.save();
		res.status(201).json({ message: "User created successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

const loginUser = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: "User not found" });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});
		res.json({ token });
	} catch (err) {
		console.log("Error: ", err);
		res.status(500).json({ message: err.message });
	}
};

module.exports = {
	createUser,
	loginUser,
};
