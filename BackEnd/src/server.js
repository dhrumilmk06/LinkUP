import express from "express";
import dotenv from "dotenv";
import authRoutes from '../src/routes/auth.route.js';
import messageRoutes from '../src/routes/message.route.js';
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json()); //req.body

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);


app.listen(PORT, () => {
    console.log("Server is Running ON Port:" + PORT);
    connectDB();
});