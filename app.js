import express from "express";
import user from "./src/controllers/user_controller.js";

const app = express();

app.use(express.json());

app.use("/api", user);

export default app;
