import 'dotenv/config';
import mongoose from 'mongoose';
if (process.env.NODE_ENV === 'production')
    throw new Error('Refusing to reset a production database.');
if (!process.env.MONGODB_URI)
    throw new Error('MONGODB_URI is required.');
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000, family: 4 });
await mongoose.connection.dropDatabase();
console.log(`✓ Development database reset: ${mongoose.connection.name}`);
await mongoose.disconnect();
