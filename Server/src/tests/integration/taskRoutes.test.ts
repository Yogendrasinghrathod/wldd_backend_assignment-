import request from 'supertest';
import app from '../../app';
import Task from '../../models/task';
import redisClient from '../../config/redis';
import jwt from 'jsonwebtoken';

// Mock Task model
jest.mock('../../models/task');

describe('Task Routes Integration Tests (Mocked DB)', () => {
    const userId = 'user123';
    let token: string;

    beforeAll(() => {
        // Generate a valid JWT token for auth middleware
        token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    beforeEach(() => {
        (redisClient.get as jest.Mock).mockReset();
        (redisClient.set as jest.Mock).mockReset();
        (redisClient.del as jest.Mock).mockReset();
        (Task.find as jest.Mock).mockReset();
        (Task.create as jest.Mock).mockReset();
        (Task.findByIdAndUpdate as jest.Mock).mockReset();
        (Task.findByIdAndDelete as jest.Mock).mockReset();
    });

    describe('POST /api/tasks', () => {
        it('should create a new task', async () => {
            const newTask = { title: 'Integration Task', status: 'pending' };
            (Task.create as jest.Mock).mockResolvedValue({ ...newTask, owner: userId, _id: 'task1' });

            const res = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send(newTask);

            expect(res.status).toBe(200);
            expect(res.body.title).toBe(newTask.title);
            expect(Task.create).toHaveBeenCalled();
        });

        it('should return 401 if no token', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({ title: 'No Auth' });
            
            // Assuming auth middleware returns 401 or 403
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/tasks', () => {
        it('should return tasks from DB on cache miss', async () => {
            (redisClient.get as jest.Mock).mockResolvedValue(null);
            (Task.find as jest.Mock).mockResolvedValue([{ title: 'DB Task', owner: userId }]);

            const res = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body[0].title).toBe('DB Task');
            expect(redisClient.get).toHaveBeenCalled();
            expect(Task.find).toHaveBeenCalled();
            expect(redisClient.set).toHaveBeenCalled();
        });
    });
});
