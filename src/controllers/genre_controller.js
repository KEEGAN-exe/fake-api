import { Router } from "express";
import {
  deleteGenre,
  findAll,
  findById,
  findByName,
  insertGenre,
  updateGenre,
} from "../services/genre_service.js";

const router = Router();

router.get("/genres", findAll);
router.get("/genres/id/:id_genre", findById);
router.get("/genres/name/:name", findByName);
router.post("/genres", insertGenre);
router.patch("/genres/:id_genre", updateGenre);
router.delete("/genres/:id_genre", deleteGenre);

export default router;
