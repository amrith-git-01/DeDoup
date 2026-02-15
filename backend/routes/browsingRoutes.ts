import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import {
    ingestEventsController,
    getSummaryController,
    getTrendsController,
    getActivityController,
    getHabitsController,
    getTopSitesController,
} from '../controllers/browsingController.js'

const router = express.Router()
router.use(authMiddleware)

router.post('/events', ingestEventsController)
router.get('/metrics/summary', getSummaryController)
router.get('/metrics/trends', getTrendsController)
router.get('/metrics/activity', getActivityController)
router.get('/metrics/habits', getHabitsController)
router.get('/metrics/top-sites', getTopSitesController)

export default router;