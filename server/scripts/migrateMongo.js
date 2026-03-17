import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const sourceUri = process.env.SOURCE_MONGODB_URI || process.env.MONGODB_URI;
const targetUri = process.env.TARGET_MONGODB_URI;

if (!sourceUri) {
    console.error('Missing SOURCE_MONGODB_URI or MONGODB_URI.');
    process.exit(1);
}

if (!targetUri) {
    console.error('Missing TARGET_MONGODB_URI.');
    process.exit(1);
}

const sourceConnection = await mongoose.createConnection(sourceUri).asPromise();
const targetConnection = await mongoose.createConnection(targetUri).asPromise();

try {
    const sourceDb = sourceConnection.db;
    const targetDb = targetConnection.db;

    const collections = await sourceDb.listCollections({}, { nameOnly: true }).toArray();

    console.log(`Migrating ${collections.length} collections from ${sourceDb.databaseName} to ${targetDb.databaseName}...`);

    for (const { name } of collections) {
        const sourceCollection = sourceDb.collection(name);
        const targetCollection = targetDb.collection(name);

        const documents = await sourceCollection.find({}).toArray();
        const indexes = await sourceCollection.indexes();

        await targetCollection.deleteMany({});

        if (documents.length > 0) {
            await targetCollection.insertMany(documents, { ordered: false });
        }

        for (const index of indexes) {
            if (index.name === '_id_') {
                continue;
            }

            const { key, name: indexName, ...options } = index;
            await targetCollection.createIndex(key, {
                ...options,
                name: indexName,
            });
        }

        console.log(`Migrated ${name}: ${documents.length} documents`);
    }

    console.log('MongoDB migration completed successfully.');
} catch (error) {
    console.error(`MongoDB migration failed: ${error.message}`);
    process.exitCode = 1;
} finally {
    await Promise.allSettled([
        sourceConnection.close(),
        targetConnection.close(),
    ]);
}