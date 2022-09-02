const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');

const userRoutes = require('./api/routes/user');
const postRoutes = require('./api/routes/posts');

const fileUpload = require('express-fileupload');

dotenv.config();
mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log("Mongo Connected...")
    }
);

mongoose.connection.on('error', err => {
    console.log("Connection failed");
});

mongoose.connection.on('connected', connected => {
    console.log("Connected with Database...");
});

app.use(fileUpload({
    useTempFiles: true
}))
app.use(bodyParser.urlencoded({ extended: false }));

//middleware
app.use(bodyParser.json());
app.use(helmet());
app.use(morgan("common"));

app.use('/user', userRoutes);
app.use('/post', postRoutes);


app.use((req, res, next) => {
    res.status(404).json({
        error: "bad request"
    })
})

module.exports = app