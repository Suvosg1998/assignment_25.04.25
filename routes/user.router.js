const router = require('express').Router();
const userController = require('../controller/user.controller');
const auth = require("../middleware/auth")(); // Initialize auth middleware
const upload = require('../helper/fileUpload'); // Middleware for handling file uploads
const fileUpload = new upload({
    folderName: "uploads", supportedFiles: ["image/png", "image/jpg", "image/jpeg"], fieldSize: 1024 * 1024 * 5
});

// Public routes
router.post('/user/signup',fileUpload.upload().single('photo'), userController.registerUser); // User registration
router.post('/user/signin', userController.loginUser); // User login
router.post('/user/validateotp', userController.validateOtp); // OTP validation
router.put('/user/edit/:id', auth.authenticate,fileUpload.upload().single('photo'), userController.editProfile); // Edit user profile (requires authentication)

// Protected routes (requires authentication)
router.get('/user/profile', auth.authenticate, userController.getProfile); // Fetch user profile

// Admin-only routes (requires authentication and admin role)
router.get('/admin/users', auth.authenticate, auth.authorize(['admin']), userController.getAllUsers); // Example admin route
router.delete('/admin/delete/:id', auth.authenticate, auth.authorize(['admin']), userController.deleteProfile); // Example admin route
module.exports = router;