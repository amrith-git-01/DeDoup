import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import {
    ingestEventsController,
    getOverviewController,
    getActivityController,
    getHabitsController,
    getTopSitesController,
    getTodayByDomainController,
    getRecentVisitsController,
    getVisitHistoryController,
} from '../controllers/browsingController.js'

const router = express.Router()
router.use(authMiddleware)

router.post('/events', ingestEventsController)
router.get('/metrics/overview', getOverviewController)
router.get('/metrics/activity', getActivityController)
router.get('/metrics/habits', getHabitsController)
router.get('/metrics/top-sites', getTopSitesController)
router.get('/metrics/today-by-domain', getTodayByDomainController)
router.get('/metrics/recent-visits', getRecentVisitsController)
router.get('/metrics/visit-history', getVisitHistoryController)
export default router;