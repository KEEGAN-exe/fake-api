import { Router } from "express";
import {
  deleteMovie,
  findAll,
  insertMovie,
  updateMovie,
} from "../services/movie_service.js";

const router = Router();

router.get("/movies", findAll);
router.post("/movies", insertMovie);
router.patch("/movies/:id_movie", updateMovie);
router.delete("/movies/:id_movie", deleteMovie);

export default router;
