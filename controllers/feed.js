const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
	Post.find().then((posts) => {
		res
			.status(200)
			.json({ message: 'Fetched posts successfully.', posts: posts });
	});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, entered data is incorrect.');
		error.statusCode = 422;
		throw error;
	}
	if (!req.file) {
		const error = new Error('No image provided.');
		error.statusCode = 422;
		throw error;
	}

	const title = req.body.title;
	const imageUrl = req.file.path;
	const content = req.body.content;

	const post = new Post({
		title: title,
		imageUrl: imageUrl,
		content: content,
		creator: { name: 'Gagan' },
	});
	post
		.save()
		.then((result) => {
			res.status(201).json({
				message: 'Post has been successfully saved.',
				post: result,
			});
		})
		.catch((err) => {
			if (!errors.statusCode) {
				errors.statusCode = 500;
			}
			next(err);
		});
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postid)
		.then((post) => {
			if (!post) {
				const error = new Error('Could Not find any post.');
				error.statusCode = 404;
				throw error;
			}
			res.status(200).json({ message: 'Post fetched.' });
		})
		.catch((err) => {
			if (!errors.statusCode) {
				errors.statusCode = 500;
			}
			next(err);
		});
};
