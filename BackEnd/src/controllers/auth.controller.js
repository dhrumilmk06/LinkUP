import User from "../models/User.js";
import bcrypt from 'bcrypt';
import generateToken from '../lib/utils.js'

export const signup = async (req,res) => {
    const {fullname, email, password} = req.body;

    try {
        if(!fullname || !email || !password){
            return res.status(400).json({ message : "All fileds are Required"});
        }
        if(password.length<6){
            return res.status(400).json({ message : "Password atleast 6 number"});
        }
        //check if emails valid using RageX 
        const emailRagex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRagex.test(email)){
            return res.status(400).json({ message : "Enter valid email"});
        }


        const user = await User.findOne({email});
        if(user) return res.status(400).json({ message :"Email Already Exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User ({
            fullname,
            email,
            password: hashedPassword
        });

        if(newUser){
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
        }else{
            res.status(400).json({message: "Inavalid user data"})
        }
    } catch (error) {
        console.log("Error in signup controller:",error);
        res.status(500).json({message: "Internal server error"});
    }

};

