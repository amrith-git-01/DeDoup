import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

if(!MONGODB_URI){
    throw new Error('MONGODB_URI is not defined in the environment variables');
}

export async function connectDB() : Promise<void>{
    try{
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");
    }catch(error){
        console.log("❌ Failed to connect to MongoDB, error: ", error);
        process.exit(1);
    }
}

mongoose.connection.on('error', (error) => {
    console.log("❌ MongoDB connection error: ", error);
});

mongoose.connection.on('disconnected', () => {
    console.log("❌ MongoDB disconnected");
});