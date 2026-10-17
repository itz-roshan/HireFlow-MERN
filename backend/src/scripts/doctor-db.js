import 'dotenv/config';
import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MongoDB connection: FAIL');
    console.error('MONGODB_URI is missing from backend/.env.');
    process.exit(1);
}
try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, family: 4 });
    await mongoose.connection.db.admin().ping();
    console.log('MongoDB connection: PASS');
    console.log(`Database: ${mongoose.connection.name}`);
    await mongoose.disconnect();
}
catch (error) {
    console.error('MongoDB connection: FAIL');
    console.error('MongoDB is not reachable. Start MongoDB or check MONGODB_URI.');
    console.error(`Reason: ${error.message}`);
    process.exit(1);
}
