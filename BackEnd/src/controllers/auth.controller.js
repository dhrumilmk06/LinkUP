import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import bcrypt from 'bcrypt';
import generateToken from '../lib/utils.js'
import { sendWelcomeEmail } from "../emails/emailhandeler.js";
import 'dotenv/config'
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fileds are Required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password atleast 6 number" });
        }
        //check if emails valid using RageX 
        const emailRagex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRagex.test(email)) {
            return res.status(400).json({ message: "Enter valid email" });
        }


        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email Already Exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword
        });

        if (newUser) {
            // before CR:
            // generateToken(newUser._id, res);
            // await newUser.save();

            // after CR:
            // Persist user first, then issue auth cookie
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilepic: newUser.profilepic
            });

            try {
                await sendWelcomeEmail(savedUser.email, savedUser.fullname, ENV.CLIENT_URL);
            } catch (error) {

            }
        } else {
            res.status(400).json({ message: "Inavalid user data" })
        }
    } catch (error) {
        console.log("Error in signup controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }

};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilepic: user.profilepic
        })
    } catch (error) {
        console.log("Error in login controller:", error);
        res.status(500).json({ message: "Internal server error" })
    }
};

export const logout = (_, res) => {
    res.cookie("jwt", "", { maxAge: 0 })
    res.status(200).json({ message: "Logout successful" })
};

export const updateProfile = async (req, res) => {
    try {
        const { profilepic } = req.body;
        if (!profilepic) return res.status(400).json({ message: "Profile pic is required" });

        const userId = req.user._id;
        console.log("updateProfile: Processing for user", userId);

        try {
            const uploadResponse = await cloudinary.uploader.upload(profilepic);
            console.log("updateProfile: Cloudinary upload success", uploadResponse.secure_url);

            const updatedUser = await User.findByIdAndUpdate(userId, { profilepic: uploadResponse.secure_url }, { new: true });
            console.log("updateProfile: Database updated", updatedUser);

            res.status(200).json(updatedUser);
        } catch (uploadError) {
            console.error("updateProfile: Upload or DB error", uploadError);
            throw uploadError;
        }

    } catch (error) {
        console.log("Error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
