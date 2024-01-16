import { Router } from "express";
import {
  deleteGenre,
  findAll,
  insertGenre,
  updateGenre,
} from "../services/genre_service.js";

const router = Router();

router.get("/genres", findAll);
router.post("/genres", insertGenre);
router.patch("/genres/:id_genre", updateGenre);
router.delete("/genres/:id_genre", deleteGenre);

export default router;
