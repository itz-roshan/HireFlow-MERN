import 'dotenv/config';
const required = ['MONGODB_URI', 'JWT_SECRET', 'REFRESH_SECRET'];
for (const key of required) {
    if (!process.env[key])
        throw new Error(`Missing environment variable: ${key}`);
}
const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('PORT must be a valid number between 1 and 65535.');
export const env = {
    port,
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30m',
    refreshSecret: process.env.REFRESH_SECRET,
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 5),
    publicApiUrl: (process.env.PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')
};
