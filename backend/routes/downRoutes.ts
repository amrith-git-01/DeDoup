// backend/routes/downRoutes.ts

import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import {
    trackDownloadController,
    getStatsController,
    getHistoryController,
    getDuplicatesController
} from '../controllers/downloadController.js'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Track download (with duplicate detection)
router.post('/track', trackDownloadController)

// Get statistics
router.get('/stats', getStatsController)

// Get download history
router.get('/history', getHistoryController)

// Get duplicate downloads
router.get('/duplicates', getDuplicatesController)

export default router