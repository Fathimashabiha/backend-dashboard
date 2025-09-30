import type { Request, Response } from 'express';
import { createUser, findUserByEmail, findUserByUsername, updateUser, findAllUsers, findUserById, deleteUser} from '../services/userService';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import  * as nodemailer from 'nodemailer';
import { User } from '../entities/User';;

// Helper function to generate and send OTP
const generateAndSendOTP = async (email: string, user: any) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

  // This is the call that must succeed
  await updateUser(user.id, { otp, otpExpiry });

  // Use a mail service like SendGrid, Mailgun, or Nodemailer with a test account
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env['EMAIL_USER'] as string,
      pass: process.env['EMAIL_PASS'] as string,
    },
  });

  const mailOptions = {
    from: process.env[ 'EMAIL_USER'] as string,
    to: email,
    subject: 'OTP for Registration',
    text: `Your OTP is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

export const register = async (req: Request, res: Response) => {
  const { name, username, email, password, phoneNumber, address } = req.body;
  try {
    console.log('Starting user registration for:', username);
    const existingUsername = await findUserByUsername(username);
    const existingEmail = await findUserByEmail(email);

    if (existingUsername || existingEmail) {
      console.log('Error: Username or email already exists.');
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    console.log('Creating new user...');
    const newUser = await createUser({ name, username, email, password, phoneNumber, address });

    console.log('User created, now generating and sending OTP...');
    await generateAndSendOTP(email, newUser);

    console.log('OTP sent successfully. Responding with 201.');
    return res.status(201).json({ message: 'User registered. OTP sent to email.', userId: newUser.id });
  } catch (error) {
    console.error('Registration failed:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const user = await findUserByEmail(email);

    if (!user || user.otp !== otp || user.otpExpiry! < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await updateUser(user.id, {
      isVerified: user.isVerified,
      otp: user.otp,
      otpExpiry: user.otpExpiry
    }); // Save changes

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};


export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    console.log('Login endpoint hit with data:', req.body)
    const user = await findUserByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env['JWT_SECRET'] as string,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await generateAndSendOTP(email, user);

     return res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
     return res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user || user.otp !== otp || user.otpExpiry! < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updateUser(user.id, {
      password: hashedPassword,
      otp: null,
      otpExpiry: null,
    });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Safer approach in a configuration file or at the start of your app
if (!process.env ['EMAIL_USER']|| !process.env['EMAIL_PASS']) {
  throw new Error("Missing EMAIL_USER or EMAIL_PASS in environment variables");
}


// --- READ: Get all users ---
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    console.log('Get all users endpoint hit');
    const users = await findAllUsers();
     return res.status(200).json(users);
  } catch (error) {
     return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// --- READ: Get a user by ID ---

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    console.log('GetUserById endpoint hit with id:', id);

    // Add a check to ensure 'id' is defined
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};


// --- UPDATE: Update user data ---
  
 export const updateUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: Partial<User> = req.body;

  try {
    console.log('UpdateUserById endpoint hit with id and data:', id, req.body);

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const updatedUser = await updateUser(id, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "User updated successfully.", user: updatedUser });
  } catch (error) {
    console.error('Update failed:', error);
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};
// --- DELETE: Delete a user ---

export const deleteUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    console.log('DeleteUserById endpoint hit with id:', id)

    // Add a check to ensure 'id' is defined
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// --- LOGOUT ---
export const logout = (_req: Request, res: Response) => {
   return res.status(200).json({ message: "Logout successful." });
};