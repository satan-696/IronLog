// server/src/routes/weightLogs.js
import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as weightLogsController from '../controllers/weightLogsController.js';

const router = Router();

router.use(verifyToken);

router.get('/',    weightLogsController.getWeightLogs);
router.post('/',   weightLogsController.saveWeightLog);
router.delete('/:id', weightLogsController.deleteWeightLog);

export default router;
