import { Router } from "express";
import {
  deleteDirector,
  findAll,
  insertDirector,
  updateDirector,
} from "../services/director_service.js";

const router = Router();

router.get("/directors", findAll);
router.post("/directors", insertDirector);
router.patch("/directors/:id_director", updateDirector);
router.delete("/directors/:id_director", deleteDirector)

export default router;
