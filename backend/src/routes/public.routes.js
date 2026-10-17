import { Router } from 'express';
import { stats, taxonomy } from '../controllers/public.controller.js';
const router = Router();
router.get('/stats', stats);
router.get('/taxonomy', taxonomy);
export default router;
