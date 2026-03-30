import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const rawMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!rawMongoUri) {
            throw new Error('Missing MongoDB connection string. Set MONGODB_URI (or MONGO_URI).');
        }

        // Normalize common env formatting issues from deploy platforms.
        const mongoUri = rawMongoUri.trim().replace(/^['\"]|['\"]$/g, '');

        let debugTarget = null;
        try {
            const parsed = new URL(mongoUri);
            debugTarget = {
                host: parsed.host,
                db: parsed.pathname?.replace(/^\//, '') || '(default)',
                user: parsed.username || '(none)'
            };
        } catch {
            // Ignore parse diagnostics; mongoose.connect will surface the real error.
        }

        if (debugTarget) {
            console.log(
                `MongoDB target -> host: ${debugTarget.host}, db: ${debugTarget.db}, user: ${debugTarget.user}`
            );
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
