import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import {
    trackDownloadController,
    getHistoryController,
    getDuplicatesController,
    getSummaryMetricsController,
    getTrendsController,
    getActivityController,
    getHabitsController,
    getFileMetricsController,
    getSourceStatsController,
} from '../controllers/downloadController.js'

const router = express.Router()

// Protect all routes with auth middleware
router.use(authMiddleware)

// Basic stats and tracking
router.post('/track', trackDownloadController)
router.get('/history', getHistoryController)
router.get('/duplicates', getDuplicatesController)

// Metrics & Analytics
router.get('/metrics/summary', getSummaryMetricsController)
router.get('/metrics/trends', getTrendsController)
router.get('/metrics/activity', getActivityController)
router.get('/metrics/habits', getHabitsController)
router.get('/metrics/files', getFileMetricsController)
router.get('/metrics/sources', getSourceStatsController)

export default router