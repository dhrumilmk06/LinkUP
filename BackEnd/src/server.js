import express from "express";
import { ENV } from "./lib/env.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from '../src/routes/auth.route.js';
import messageRoutes from '../src/routes/message.route.js';
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();



const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "10mb" })); //req.body
app.use(cookieParser());
app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);


server.listen(PORT, () => {
    console.log("Server is Running ON Port:" + PORT);
    connectDB();
});