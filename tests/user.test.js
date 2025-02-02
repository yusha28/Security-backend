import mongoose from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../app';
import { User } from '../models/userSchema';

dotenv.config();  

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  await User.deleteMany();  
});

afterAll(async () => {
  await mongoose.connection.close();  
});

describe('User API', () => {

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/v1/user/register')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'Job Seeker',
      });

    expect(response.status).toBe(201);  
    expect(response.body).toHaveProperty('message', 'User Registered!');  
  });

  it('should not register a user with an existing email', async () => {
    await User.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '1234567890',
      password: 'password123',
      role: 'Job Seeker',
    });

    const response = await request(app)
      .post('/api/v1/user/register')
      .send({
        name: 'Jane Doe',
        email: 'johndoe@example.com',
        phone: '0987654321',
        password: 'password456',
        role: 'Job Seeker',
      });

    expect(response.status).toBe(409);  // Expecting a conflict error
    expect(response.body).toHaveProperty('message', 'Email already registered!');
  });

  it('should login successfully with correct credentials', async () => {
    await User.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '1234567890',
      password: 'password123',
      role: 'Job Seeker',
    });

    const response = await request(app)
      .post('/api/v1/user/login')
      .send({
        email: 'johndoe@example.com',
        password: 'password123',
        role: 'Job Seeker',
      });

    expect(response.status).toBe(201);  
    expect(response.body).toHaveProperty('message', 'User Logged In!');  
  });

  it('should not login with incorrect password', async () => {
    await User.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '1234567890',
      password: 'password123',
      role: 'Job Seeker',
    });

    const response = await request(app)
      .post('/api/v1/user/login')
      .send({
        email: 'johndoe@example.com',
        password: 'wrongpassword',
        role: 'Job Seeker',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toHaveProperty('message', 'Invalid Email Or Password.');
  });

  it('should not login if the role does not match', async () => {
    await User.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '1234567890',
      password: 'password123',
      role: 'Employer',
    });

    const response = await request(app)
      .post('/api/v1/user/login')
      .send({
        email: 'johndoe@example.com',
        password: 'password123',
        role: 'Job Seeker',
      });

    expect(response.status).toBe(404);  
    expect(response.body).toHaveProperty('message', 'User with provided email and Job Seeker not found!');
  });

  it('should not login if the user is not active', async () => {
    await User.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '1234567890',
      password: 'password123',
      role: 'Employer',
      is_active: false,
    });

    const response = await request(app)
      .post('/api/v1/user/login')
      .send({
        email: 'johndoe@example.com',
        password: 'password123',
        role: 'Employer',
      });

    expect(response.status).toBe(403);  
    expect(response.body).toHaveProperty('message', 'Validation by admin remaining');
  });
});
