import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as c from '../controllers/report.controller.js';
const r = Router();
r.use(requireAuth);
r.post('/', c.create);
r.patch('/:id', requireRole('ADMIN'), c.update);
export default r;
