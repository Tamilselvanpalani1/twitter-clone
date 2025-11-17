import express from 'express';
import authRoute from './routes/auth.route.js'; // include .js extension
import userRoute from './routes/user.route.js'; // Example for user routes
import postRoute from './routes/post.route.js'; // Example for post routes
import notificationRoute from './routes/notification.route.js'; // Example for notification routes
import dotenv from 'dotenv'; // ✅ Use `import` not `require`
dotenv.config(); // load env vars
import connectDB from './db/connectDb.js' // importtig DB
import cookieParser from 'cookie-parser'; //importting cookieparser
import { v2 as cloudinary } from 'cloudinary'; //importing cloudinary

// Create Express app
const app = express();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY
})

//CORS middleware
import cors from 'cors';
app.use(cors({
  origin: 'http://localhost:3000', // frontend URL
  credentials: true, // allow cookies to be sent
}))
const PORT = process.env.PORT;
//Informing  to the express that json data is coming from the front-end
app.use(express.json(
  {
    limit : "5mb" // file max-size should be lessthan 5mb from the front-end - default value 100kb
  }
))
//Middleware - informing express that we are going to use the cookie parser
app.use(cookieParser())
app.use(express.urlencoded({ extended: true })); // to handle form data

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute); // Example for user routes
app.use('/api/posts', postRoute); // Example for post routes
app.use('/api/notifications', notificationRoute); // Example for notification routes


app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
  //connecting to the mongodb once the server is ran.
  connectDB(); //calling the function
});
