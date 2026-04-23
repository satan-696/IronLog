// server/src/routes/mealLogs.js
import { Router } from 'express';
import { getMealsForDay, getDailyTotals, addFood, deleteFood } from '../controllers/mealLogsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// IMPORTANT: /totals/:dateKey must come before /:dateKey to avoid collision
router.get('/totals/:dateKey', getDailyTotals);
router.get('/:dateKey',        getMealsForDay);
router.post('/',               addFood);
router.delete('/:id',          deleteFood);

export default router;
