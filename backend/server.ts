import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import app from './app.js'

dotenv.config()

const PORT = process.env.PORT || 3000

async function startServer() {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`)
            console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
        })

        function shutdown(signal: string) {
            console.log(`${signal} received, shutting down...`)
            server.close(() => {
                console.log('Server closed')
                process.exit(0)
            })
        }

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

    } catch (error) {
        console.error('❌ Failed to start server, error: ', error)
        process.exit(1)
    }
}

startServer()