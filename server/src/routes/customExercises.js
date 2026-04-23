// server/src/routes/customExercises.js
import { Router } from 'express';
import {
  getCustomExercises, createCustomExercise, deleteCustomExercise,
} from '../controllers/customExercisesController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

router.get('/',     getCustomExercises);
router.post('/',    createCustomExercise);
router.delete('/:id', deleteCustomExercise);

export default router;
