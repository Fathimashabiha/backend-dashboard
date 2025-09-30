import { Router } from 'express';
import { register, verifyOTP, login, forgotPassword, resetPassword, logout } from '../controller/authController';
import { getAllUsers, getUserById, updateUserById, deleteUserById } from '../controller/authController';


const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post("/logout", logout);
router.get("/users", getAllUsers); 
router.get("/:id", getUserById); 
router.put("/:id", updateUserById);
router.delete("/:id", deleteUserById);


export default router;