// server/src/routes/workoutLogs.js
import { Router } from 'express';
import { getWeekLogs, getMonthLogs, saveSet, deleteSet } from '../controllers/workoutLogsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

router.get('/week/:weekKey',       getWeekLogs);
router.get('/month/:year/:month',  getMonthLogs);
router.post('/',                   saveSet);
router.delete('/:id',              deleteSet);

export default router;
