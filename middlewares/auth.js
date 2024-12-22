const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "No token provided" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}
		req.user = { id: user._id };
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid token" });
	}
};

module.exports = authenticate;
