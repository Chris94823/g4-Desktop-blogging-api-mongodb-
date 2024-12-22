const express = require("express");
const { body } = require("express-validator");
const { loginUser, createUser } = require("../controllers/authController");

const router = express.Router();

router.post(
	"/create",
	[
		body("email").isEmail(),
		body("password").isLength({ min: 6 }),
		body("first_name").notEmpty(),
		body("last_name").notEmpty(),
	],
	createUser
);

router.post("/login", loginUser);

module.exports = router;
