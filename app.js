const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, uuidv4() + file.originalname);
	},
});
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use(express.json());
app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'),
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, PATCH, DELETE',
	);
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type',
		'Authorization',
	);
	next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

mongoose
	.connect(
		'mongodb+srv://gags:gags123@alpha.tlchy.mongodb.net/restApi?retryWrites=true&w=majority',
		{
			useUnifiedTopology: true,
			useNewUrlParser: true,
		},
	)
	.then((result) => {
		console.log('Connected to the Database.');
		//Store the server returned by the express app
		const server = app.listen(8080, (result) => {
			console.log('Listening for requests on port 8080');
		});
		//Pass the server as an argument to the function returned by socket.io and execute it
		const io = require('./socket').init(server);
		//Create an event listener for new connections and execute a function for each new connection
		io.on('connection', (socket) => {
			console.log('Client connected.');
		});
	})
	.catch((err) => console.log(err));
