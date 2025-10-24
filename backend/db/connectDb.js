import mongoose from 'mongoose'

const connectDB = async () => {
    try{
        //MONGO_URL is comes from the .env file and that DB is created in the mongoose atlas
        await mongoose.connect(process.env.MONGO_URL)
        console.log(`MongoDB connected`)
    }catch(error){
        console.log(`Error in connecting Db: ${error}`)
        process.exit(1) //1 -> true -> if any errors occurs stop the entire server
    }
}

export default connectDB;