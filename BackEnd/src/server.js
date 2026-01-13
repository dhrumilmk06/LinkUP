import express from "express";
import { ENV } from "./lib/env.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from '../src/routes/auth.route.js';
import messageRoutes from '../src/routes/message.route.js';
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../FrontEnd/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../../FrontEnd/dist/index.html"));
    });
}


server.listen(PORT, () => {
    console.log("Server is Running ON Port:" + PORT);
    connectDB();
});