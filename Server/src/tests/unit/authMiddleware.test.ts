import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware, { AuthRequest } from '../../middlewares/authMiddleware';

jest.mock('jsonwebtoken');

describe('authMiddleware Unit Tests', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    req = {
      headers: {},
    };
    res = {
      status: statusMock,
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() if token is valid', () => {
    req.headers!.authorization = 'Bearer validToken';
    const mockDecoded = { userId: 'user123' };
    (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
    process.env.JWT_SECRET = 'testsecret';

    authMiddleware(req as AuthRequest, res as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith('validToken', 'testsecret');
    expect(req.userId).toBe('user123');
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', () => {
    authMiddleware(req as AuthRequest, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.headers!.authorization = 'Bearer invalidToken';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    authMiddleware(req as AuthRequest, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid Token' });
    expect(next).not.toHaveBeenCalled();
  });
});
