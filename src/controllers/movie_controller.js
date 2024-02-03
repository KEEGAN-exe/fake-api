import { Router } from "express";
import {
  deleteMovie,
  filterByDuration,
  filterByDurationRange,
  findAll,
  findById,
  findByTitle,
  insertMovie,
  updateMovie,
  findByDirectorName,
} from "../services/movie_service.js";

const router = Router();

router.get("/movies", findAll);
router.get("/movies/search", findByTitle);
router.get("/movies/duration", filterByDurationRange);
router.get("/movies/duration=:duration", filterByDuration);
router.get("/movies/director=:director_name", findByDirectorName);
router.post("/movies", insertMovie);
router.get("/movies/:id_movie", findById);
router.patch("/movies/:id_movie", updateMovie);
router.delete("/movies/:id_movie", deleteMovie);

export default router;
