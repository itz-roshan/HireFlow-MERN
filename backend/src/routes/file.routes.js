import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as c from '../controllers/file.controller.js';
const r = Router();
r.use(requireAuth);
r.get('/resume/me', c.myResume);
r.get('/application-resume/:id', c.applicationResume);
export default r;
