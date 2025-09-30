import { AppDataSource } from '../config/ormconfig';
import { User } from '../entities/User';
import * as bcrypt from 'bcryptjs';



const userRepository = AppDataSource.getRepository(User);

export const createUser = async (userData: Partial<User>) => {
  const hashedPassword = await bcrypt.hash(userData.password!, 10);
  const newUser = userRepository.create({
    ...userData,
    password: hashedPassword,
  });
  return userRepository.save(newUser);
};

export const findUserByEmail = async (email: string) => {
  return userRepository.findOne({ where: { email } });
};

export const findUserByUsername = async (username: string) => {
  return userRepository.findOne({ where: { username } });
};


export const updateUser = async (userId: string, updatedData: Partial<User>) => {
  // Find the user by ID using the single userRepository instance
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    return null; 
  }

  // Apply partial updates
  Object.assign(user, updatedData);

  // Save the updated user object
  return userRepository.save(user);
};


// Find a user by ID
export const findUserById = async (id: string): Promise<User | null> => {
  return await userRepository.findOne({ where: { id } });
};

// Get all users
export const findAllUsers = async (): Promise<User[]> => {
  return await userRepository.find();
};



// Delete a user
export const deleteUser = async (id: string): Promise<User | null> => {
  const user = await userRepository.findOne({ where: { id} });
  if (!user) {
    return null;
  }
  await userRepository.remove(user);
  return user;
};

// Validate a user's password
export const validatePassword = async (password: string, userPasswordHash: string): Promise<boolean> => {
  return await bcrypt.compare(password, userPasswordHash);
};