import { Router } from "express";
import {
  deleteMovie,
  findAll,
  findById,
  findByTitle,
  insertMovie,
  updateMovie,
} from "../services/movie_service.js";

const router = Router();

router.get("/movies", findAll);
router.get("/movies/id/:id_movie", findById);
router.get("/movies/title/:title", findByTitle);
router.post("/movies", insertMovie);
router.patch("/movies/:id_movie", updateMovie);
router.delete("/movies/:id_movie", deleteMovie);

export default router;
