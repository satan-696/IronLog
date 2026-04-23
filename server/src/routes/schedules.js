// server/src/routes/schedules.js
import { Router } from 'express';
import { getSchedule, updateDay, applySplit } from '../controllers/schedulesController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/',               getSchedule);  // GET  /api/schedules
router.put('/:dayIndex',      updateDay);    // PUT  /api/schedules/:dayIndex
router.post('/apply-split',   applySplit);   // POST /api/schedules/apply-split

export default router;
