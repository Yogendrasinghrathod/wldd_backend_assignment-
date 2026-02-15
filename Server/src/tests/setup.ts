import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn(),
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }),
}));

let mongoServer: MongoMemoryServer;

if (process.env.SKIP_MONGO !== 'true') {
  beforeAll(async () => {
      console.log('Starting MongoMemoryServer... (this may take a while to download binary)');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('MongoMemoryServer started');
  });

  afterAll(async () => {
      await mongoose.disconnect();
      if (mongoServer) {
        await mongoServer.stop();
      }
  });

  afterEach(async () => {
      if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
      }
  });
}
