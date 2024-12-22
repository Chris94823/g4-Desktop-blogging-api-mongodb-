const Blog = require("../models/Blog");

const calculateReadingTime = (text) => {
	const words = text.split(" ").length;
	const minutes = Math.ceil(words / 200);
	return `${minutes} min read`;
};

const getBlogs = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 20,
			search,
			sortBy = "timestamp",
			order = "desc",
			author,
			title,
			tags,
		} = req.query;

		const filters = { state: "published" };
		if (author) filters["author"] = new RegExp(author, "i");
		if (title) filters["title"] = new RegExp(title, "i");
		if (tags) filters["tags"] = { $in: tags.split(",") };

		const skip = (page - 1) * limit;
		const blogs = await Blog.find(filters)
			.sort({ [sortBy]: order === "desc" ? -1 : 1 })
			.skip(skip)
			.limit(parseInt(limit))
			.populate("author", "first_name last_name email");

		const total = await Blog.countDocuments(filters);
		const totalPages = Math.ceil(total / limit);

		res.status(200).json({
			data: blogs,
			meta: {
				currentPage: parseInt(page),
				totalPages,
				totalItems: total,
				pageSize: parseInt(limit),
			},
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

const getMyBlogs = async (req, res) => {
	try {
		const { page = 1, limit = 20, state } = req.query;

		const filters = { author: req.user.id };
		if (state) filters["state"] = state;

		const skip = (page - 1) * limit;
		const blogs = await Blog.find(filters)
			.sort({ timestamp: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Blog.countDocuments(filters);
		const totalPages = Math.ceil(total / limit);

		res.status(200).json({
			data: blogs,
			meta: {
				currentPage: parseInt(page),
				totalPages,
				totalItems: total,
				pageSize: parseInt(limit),
			},
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

const getSingleBlog = async (req, res) => {
	try {
		const blog = await Blog.findById(req.params.id).populate(
			"author",
			"first_name last_name email"
		);
		if (!blog || blog.state !== "published") {
			return res
				.status(404)
				.json({ message: "Blog not found or not published" });
		}

		blog.read_count += 1;
		await blog.save();

		res.status(200).json(blog);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

const createBlog = async (req, res) => {
	try {
		const { title, description, tags, body } = req.body;

		if (!title || !body) {
			return res
				.status(400)
				.json({ message: "Title and body are required" });
		}

		const newBlog = new Blog({
			title,
			description,
			tags,
			body,
			author: req.user.id,
			state: "draft",
			read_count: 0,
			reading_time: calculateReadingTime(body),
			timestamp: new Date(),
		});

		await newBlog.save();
		res.status(201).json({
			message: "Blog created successfully",
			blog: newBlog,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Error creating the blog" });
	}
};

module.exports = {
	getBlogs,
	getMyBlogs,
	getSingleBlog,
	createBlog,
};
