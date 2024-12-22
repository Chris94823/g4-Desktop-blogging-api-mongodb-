const express = require("express");
const authenticate = require("../middlewares/auth");
const {
	createBlog,
	getSingleBlog,
	getMyBlogs,
	getBlogs,
} = require("../controllers/blogController");

const router = express.Router();

router.get("/", getBlogs);

router.get("/my-blogs", authenticate, getMyBlogs);

router.get("/:id", getSingleBlog);

router.post("/", authenticate, createBlog);

module.exports = router;
