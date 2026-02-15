import { Response } from 'express';
import { getTask, updateTask, deleteTask } from '../../controllers/taskController';
import Task from '../../models/task';
import { AuthRequest } from '../../middlewares/authMiddleware';
import redisClient from '../../config/redis';

jest.mock('../../models/task');
jest.mock('../../config/redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
}));

describe('taskController Unit Tests (Fixed)', () => {
    let req: Partial<AuthRequest>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = {
            status: statusMock,
        };
        req = {
            userId: 'user123',
            params: {},
            body: {},
            query: {}
        };
        jest.clearAllMocks();
    });

    describe('getTask', () => {
        it('should return tasks from DB on cache miss', async () => {
             (redisClient.get as jest.Mock).mockResolvedValue(null);
             (Task.find as jest.Mock).mockResolvedValue([{ title: 'Task 1' }]);
             
             await getTask(req as AuthRequest, res as Response);
             
             expect(Task.find).toHaveBeenCalled();
             expect(statusMock).toHaveBeenCalledWith(200);
             expect(jsonMock).toHaveBeenCalledWith([{ title: 'Task 1' }]);
        });

        it('should return tasks from cache on hit', async () => {
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify([{ title: 'Cached Task' }]));
            
            await getTask(req as AuthRequest, res as Response);
            
            expect(Task.find).not.toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith([{ title: 'Cached Task' }]);
        });
    });

    describe('updateTask', () => {
        it('should update a task and return 200', async () => {
            req.params = { id: '60d5ecb8b392d40015f2c2c1' }; // valid mongo id format
            req.body = { title: 'Updated Task' };
            (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: '60d5ecb8b392d40015f2c2c1', title: 'Updated Task' });

            await updateTask(req as AuthRequest, res as Response);

            expect(Task.findByIdAndUpdate).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
        });

        it('should return 404 if task to update is not found', async () => {
            req.params = { id: '60d5ecb8b392d40015f2c2c1' };
            (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await updateTask(req as AuthRequest, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Task not found' });
        });
    });

    describe('deleteTask', () => {
        it('should delete a task and return 200', async () => {
            req.params = { id: '60d5ecb8b392d40015f2c2c1' };
            (Task.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: '60d5ecb8b392d40015f2c2c1' });

            await deleteTask(req as AuthRequest, res as Response);

            expect(Task.findByIdAndDelete).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Task Deleted successfully' });
        });

        it('should return 404 if task to delete is not found', async () => {
            req.params = { id: '60d5ecb8b392d40015f2c2c1' };
            (Task.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            await deleteTask(req as AuthRequest, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'task not found' });
        });
    });
});
