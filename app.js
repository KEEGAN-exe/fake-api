import express from "express";
import user from "./src/controllers/user_controller.js";
import director from "./src/controllers/director_controller.js";
import movies from "./src/controllers/movie_controller.js";
import genre from "./src/controllers/genre_controller.js";
import login from "./src/controllers/auth_controller.js";

const app = express();

app.use(express.json());

app.use("/api", user);
app.use("/api", director);
app.use("/api", genre);
app.use("/api", movies);
app.use("/api", login);

export default app;
