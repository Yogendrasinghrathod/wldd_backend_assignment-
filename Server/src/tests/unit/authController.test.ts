import { Request, Response } from 'express';
import { signup, login } from '../../controllers/authController';
import User from '../../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../models/user');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('authController Unit Tests', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
    };
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return 200', async () => {
      req = {
        body: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (User.create as jest.Mock).mockResolvedValue({ _id: 'user123' });

      await signup(req as Request, res as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User created Successfully',
        userId: 'user123',
      });
    });

    it('should return 400 if user already exists', async () => {
      req = {
        body: { email: 'existing@example.com', password: 'password123', name: 'Existing User' },
      };

      (User.findOne as jest.Mock).mockResolvedValue({ email: 'existing@example.com' });

      await signup(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'User exists already' });
    });

    it('should return 500 on server error', async () => {
      req = {
        body: { email: 'error@example.com', password: 'password123', name: 'Error User' },
      };

      (User.findOne as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await signup(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Server Error' });
    });
  });

  describe('login', () => {
    it('should login successfully and return 200 with token', async () => {
      req = {
        body: { email: 'test@example.com', password: 'password123' },
      };

      const mockUser = { _id: 'user123', email: 'test@example.com', password: 'hashedPassword' };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      process.env.JWT_SECRET = 'testsecret';

      await login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'login Succesfull',
        token: 'mockToken',
      });
    });

    it('should return 400 for invalid email', async () => {
      req = {
        body: { email: 'wrong@example.com', password: 'password123' },
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid Cridentials' });
    });

    it('should return 400 for invalid password', async () => {
      req = {
        body: { email: 'test@example.com', password: 'wrongpassword' },
      };

      (User.findOne as jest.Mock).mockResolvedValue({ password: 'hashedPassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid Cridentials' });
    });

    it('should return 500 on server error', async () => {
      req = {
        body: { email: 'error@example.com', password: 'password123' },
      };

      (User.findOne as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Server Error' });
    });
  });
});
