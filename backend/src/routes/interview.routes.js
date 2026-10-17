import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as c from '../controllers/interview.controller.js';
const r = Router();
r.use(requireAuth);
r.get('/', c.list);
r.post('/', requireRole('RECRUITER'), c.create);
r.patch('/:id/status', c.update);
export default r;
