import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { attachSocket } from './socket.js';
import { setNotificationIO } from './services/notification.service.js';
let server;
try {
    await connectDB();
    server = http.createServer(app);
    const io = attachSocket(server);
    setNotificationIO(io);
    server.on('error', (error) => {
        if (error?.code === 'EADDRINUSE') {
            console.error(`✕ Port ${env.port} is already in use. Stop the other process or change PORT in backend/.env.`);
        }
        else {
            console.error(`✕ Server error: ${error?.message || 'Unknown server error'}`);
        }
        process.exitCode = 1;
    });
    server.listen(env.port, () => console.log(`✓ HireFlow API running at http://localhost:${env.port}`));
}
catch (error) {
    console.error(`✕ ${error.message}`);
    process.exitCode = 1;
}
async function shutdown(signal) {
    try {
        const mongoose = await import('mongoose');
        if (server)
            await new Promise((resolve) => server.close(resolve));
        await mongoose.default.disconnect();
        console.log(`✓ HireFlow stopped (${signal})`);
        process.exit(0);
    }
    catch {
        process.exit(1);
    }
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
