import request from 'supertest';
import app from '../../app';
import User from '../../models/user';

describe('authRoutes Integration Tests', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Integration User',
        email: 'integration@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User created Successfully');
      expect(response.body).toHaveProperty('userId');

      const user = await User.findOne({ email: userData.email });
      expect(user).not.toBeNull();
      expect(user!.name).toBe(userData.name);
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        name: 'Existing User',
        email: 'exists@example.com',
        password: 'password123',
      };

      await User.create(userData);

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User exists already');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return a token', async () => {
      const userData = {
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
      };

      // Register the user first (or use User.create directly if bypassing signup logic)
      await request(app).post('/api/auth/signup').send(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'login Succesfull');
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid Cridentials');
    });
  });
});
