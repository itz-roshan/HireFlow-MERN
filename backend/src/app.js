import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { pingDB } from './config/db.js';
import auth from './routes/auth.routes.js';
import profile from './routes/profile.routes.js';
import company from './routes/company.routes.js';
import job from './routes/job.routes.js';
import application from './routes/application.routes.js';
import saved from './routes/saved.routes.js';
import interview from './routes/interview.routes.js';
import notification from './routes/notification.routes.js';
import report from './routes/report.routes.js';
import admin from './routes/admin.routes.js';
import message from './routes/message.routes.js';
import fileRoutes from './routes/file.routes.js';
import publicRoutes from './routes/public.routes.js';
import { notFound, errorHandler } from './middleware/error.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
/*
|--------------------------------------------------------------------------
| Basic App Configuration
|--------------------------------------------------------------------------
*/
app.set('trust proxy', 1);
/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/
app.use(helmet({
    crossOriginResourcePolicy: false
}));
/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/
app.use(cors({
    origin: env.clientUrl,
    credentials: true
}));
/*
|--------------------------------------------------------------------------
| Body & Cookie Middleware
|--------------------------------------------------------------------------
*/
app.use(cookieParser());
app.use(express.json({
    limit: '2mb'
}));
/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: true,
    legacyHeaders: false
}));
/*
|--------------------------------------------------------------------------
| Static Uploads
|--------------------------------------------------------------------------
*/
app.use('/uploads/images', express.static(path.resolve(__dirname, '../uploads/images'), {
    index: false,
    maxAge: '1h'
}));
/*
|--------------------------------------------------------------------------
| Root API Route
|--------------------------------------------------------------------------
*/
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'HireFlow API',
        message: 'HireFlow backend is running',
        health: '/api/health',
        databaseHealth: '/api/health/db'
    });
});
/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
app.use('/api/public', publicRoutes);
/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'HireFlow API',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/health/db', async (req, res) => {
    try {
        await pingDB();
        return res.status(200).json({
            success: true,
            database: 'MongoDB',
            status: 'UP'
        });
    }
    catch (error) {
        return res.status(503).json({
            success: false,
            message: 'HireFlow database is unavailable.',
            code: 'DB_UNAVAILABLE',
            database: 'MongoDB',
            status: 'DOWN'
        });
    }
});
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/companies', company);
app.use('/api/jobs', job);
app.use('/api/applications', application);
app.use('/api/saved-jobs', saved);
app.use('/api/interviews', interview);
app.use('/api/notifications', notification);
app.use('/api/reports', report);
app.use('/api/admin', admin);
app.use('/api/messages', message);
app.use('/api/files', fileRoutes);
/*
|--------------------------------------------------------------------------
| 404 Handler
| IMPORTANT: Must be AFTER all routes
|--------------------------------------------------------------------------
*/
app.use(notFound);
/*
|--------------------------------------------------------------------------
| Global Error Handler
| IMPORTANT: Must be LAST
|--------------------------------------------------------------------------
*/
app.use(errorHandler);
export default app;
