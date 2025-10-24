import express from 'express';
import authRoute from './routes/auth.route.js'; // include .js extension
import userRoute from './routes/user.route.js'; // Example for user routes
import dotenv from 'dotenv'; // ✅ Use `import` not `require`
import connectDB from './db/connectDb.js' // importtig DB
import cookieParser from 'cookie-parser'; //importting cookieparser
import cloudinary from 'cloudinary'; //importing cloudinary

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY
})
dotenv.config(); // load env vars

const app = express();
const PORT = process.env.PORT;
//Informing  to the express that json data is coming from the front-end
app.use(express.json())
//Middleware - informing express that we are going to use the cookie parser
app.use(cookieParser())

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute); // Example for user routes


app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
  //connecting to the mongodb once the server is ran.
  connectDB(); //calling the function
});
