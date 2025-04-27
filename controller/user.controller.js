const userModel = require('../model/user.model');
const Mailer = require('../helper/mailer');
const jwt = require('jsonwebtoken')
const fs = require('fs');
const path = require('path');

class UserController {
    async registerUser(req, res) {
        try {
            const photo = req.file?.filename; // Get the uploaded photo filename
            const { name, email, password } = req.body;

            // Validate input fields
            if (!name || !email || !password || !photo) {
                if (photo) {
                    fs.unlinkSync(path.join(__dirname, '../uploads', photo)); // Delete uploaded photo if validation fails
                }
                return res.status(400).json({ message: "All fields, including photo, are required." });
            }

            // Check if email already exists
            const isEmailExists = await userModel.findOne({ email, isDeleted: false });
            if (isEmailExists) {
                if (photo) {
                    fs.unlinkSync(path.join(__dirname, '../uploads', photo)); // Delete uploaded photo if email exists
                }
                return res.status(400).json({ message: "Email already exists." });
            }

            // Hash the password
            const hashedPassword = await new userModel().generateHash(password);

            // Create new user record
            const saveUser = await userModel.create({
                name,
                email,
                password: hashedPassword,
                photo, // Save the photo filename
                otp: Math.floor(100000 + Math.random() * 900000), // Generate OTP
                isVerified: false,
                isDeleted: false
            });

            if (saveUser) {
                const mailer = new Mailer('Gmail', process.env.APP_EMAIL, process.env.APP_PASSWORD);

                const mailObj = {
                    to: email,
                    subject: "Registration Confirmation",
                    text: `You have successfully registered with us using the email ${email}. Thank you! Your OTP is ${saveUser.otp}.`
                };

                mailer.sendMail(mailObj);

                return res.status(200).json({ message: "User registered successfully. Please validate your OTP.", data: saveUser });
            } else {
                if (photo) {
                    fs.unlinkSync(path.join(__dirname, '../uploads', photo)); // Delete uploaded photo if registration fails
                }
                return res.status(500).json({ message: "User registration failed." });
            }
        } catch (err) {
            console.error("Error during registration:", err);
            res.status(500).json({ message: "Server error.", error: err.message });
        }
    }

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
    
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }
    
            const user = await userModel.findOne({ email, isDeleted: false });
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
    
            if (user.isVerified === false) {
                return res.status(403).json({ message: "Please verify your OTP before logging in." });
            }
    
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid password." });
            }
    
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
            res.status(200).json({
                message: "Login successful.",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error.", error: error.message });
        }
    }
    
    

    async validateOtp(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User already verified" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        await userModel.updateOne( {email},  { isVerified: true, otp: null }  ); // Mark user as verified and clear OTP

        const mailer = new Mailer('Gmail', process.env.APP_EMAIL, process.env.APP_PASSWORD);

        const mailObj = {
            to: email,
            subject: "Registration Confirmation",
            text: `Congratulations ${user.name}! You have successfully registered with us using the email ${email}. Thank you!`
        };

        mailer.sendMail(mailObj);

        return res.status(200).json({ message: "OTP validated successfully" });
    } catch (err) {
        console.error("Error during OTP validation:", err);
        res.status(500).json({ message: "Server error.", error: err.message });
    }
}
    
async getProfile(req, res) {
    try {
        const userId = req.user._id; // Extract user ID from the authenticated request

        // Fetch user details from the database
        const user = await userModel.findOne({ _id: userId, isDeleted: false }).select('-password, -__v, -isDeleted, -isVerified, -otp'); // Exclude sensitive fields

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({
            message: "Profile fetched successfully.",
            data: user
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
}
async editProfile(req, res) {
    try {
        const userId = req.user._id; // Extract user ID from the authenticated request
        const { name, email } = req.body;
        const photo = req.file?.filename;

        // Fetch the user
        const user = await userModel.findOne({ _id: userId, isDeleted: false });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // If a new photo is uploaded, delete the old one
        if (photo && user.photo) {
            fs.unlinkSync(path.join(__dirname, '../uploads', user.photo));
        }

        // Update user details
        user.name = name || user.name;
        user.email = email || user.email;
        user.photo = photo || user.photo;

        await user.save();

        return res.status(200).json({ message: "Profile updated successfully.", user });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
}

// Delete Profile (Soft Delete)
async deleteProfile(req, res) {
    try {
        const userId = req.params.id; // Extract user ID from the authenticated request

        // Fetch the user
        const user = await userModel.findOne({ _id: userId, isDeleted: false });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Mark the user as deleted
        user.isDeleted = true;
        await user.save();

        return res.status(200).json({ message: "Profile deleted successfully." });
    } catch (error) {
        console.error("Error deleting profile:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
}
async getAllUsers(req, res) {
    try {
        // Fetch all users excluding sensitive fields and soft-deleted users
        const users = await userModel.find({ isDeleted: false }).select('-password -otp -__v');

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }

        return res.status(200).json({
            message: "Users fetched successfully.",
            data: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
}

}

module.exports = new UserController();