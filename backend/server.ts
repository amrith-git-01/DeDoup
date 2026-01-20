import dotenv from 'dotenv';
import {connectDB} from './config/database';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer(){
    try{
        await connectDB();

        app.listen(PORT, ()=>{
            console.log(`✅ Server is running on port ${PORT}`);
        });
    }catch(error){
        console.error("❌ Failed to start server, error: ", error);
        process.exit(1);
    }
}

startServer();
