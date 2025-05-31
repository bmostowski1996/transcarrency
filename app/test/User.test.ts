// Removed unused import of MongoMemoryServer
import User from '../src/models/User'; // Adjust the path to your User model
import mongoose from 'mongoose';

describe('User Model Tests', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect('mongodb://localhost:27017/testdb', {
      // useUnifiedTopology is no longer needed as it is the default behavior
    });
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  it('should create a new user', async () => {
    const mockUser = {
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedpassword',
    };

    const user = new User(mockUser);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(mockUser.email);
    expect(savedUser.firstName).toBe(mockUser.firstName);
    expect(savedUser.lastName).toBe(mockUser.lastName);
  });

  it('should not save a user without required fields', async () => {
    const mockUser = {
      firstName: 'John',
    };

    const user = new User(mockUser);

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect((error as any).name).toBe('ValidationError');
  });

  it('should find a user by email', async () => {
    const mockUser = {
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      password: 'hashedpassword',
    };

    await new User(mockUser).save();

    const foundUser = await User.findOne({ email: 'jane@example.com' });
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(mockUser.email);
  });
});