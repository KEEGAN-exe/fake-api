import express from "express";
import user from "./src/controllers/user_controller.js";
import director from "./src/controllers/director_controller.js";
import genre from "./src/controllers/genre_controller.js";

const app = express();

app.use(express.json());

app.use("/api", user);
app.use("/api", director);
app.use("/api", genre);

export default app;
