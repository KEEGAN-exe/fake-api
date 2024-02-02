import { Router } from "express";
import {
  deleteDirector,
  findAll,
  findById,
  findByName,
  findByNationality,
  insertDirector,
  updateDirector,
} from "../services/director_service.js";

const router = Router();

router.get("/directors", findAll);
router.get("/directors/id/:id_director", findById);
router.get("/directors/name/:name", findByName);
router.get("/directors/nationality/:nationality", findByNationality);
router.post("/directors", insertDirector);
router.patch("/directors/:id_director", updateDirector);
router.delete("/directors/:id_director", deleteDirector);

export default router;
