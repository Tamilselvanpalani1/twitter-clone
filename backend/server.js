import express from 'express';
import authRoute from './routes/auth.route.js'; // include .js extension
import dotenv from 'dotenv'; // ✅ Use `import` not `require`
import connectDB from './db/connectDb.js' // importtig DB

dotenv.config(); // load env vars

const app = express();
const PORT = process.env.PORT;

app.use('/api/auth', authRoute);
// app.get('/', (req, res) => {
//     res.send('created')
// })

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
  //connecting to the mongodb once the server is ran.
  connectDB(); //calling the function
});
