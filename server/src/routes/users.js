// server/src/routes/users.js
import { Router } from 'express';
import { getMe, updateMe, deleteMe } from '../controllers/usersController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken); // all routes require auth

router.get('/',    getMe);     // GET  /api/users/me → re-routed as /
router.put('/',    updateMe);  // PUT  /api/users/me
router.delete('/', deleteMe);  // DELETE /api/users/me

export default router;
