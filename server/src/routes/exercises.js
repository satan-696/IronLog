// server/src/routes/exercises.js
import { Router } from 'express';
import {
  getExercises, createExercise, updateExercise,
  deleteExercise, reorderExercises,
} from '../controllers/exercisesController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// IMPORTANT: /reorder must come before /:id to avoid collision
router.put('/reorder',     reorderExercises);
router.get('/:scheduleId', getExercises);
router.post('/',           createExercise);
router.put('/:id',         updateExercise);
router.delete('/:id',      deleteExercise);

export default router;
