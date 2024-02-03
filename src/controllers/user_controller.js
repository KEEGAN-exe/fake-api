import { Router } from "express";
import {
  deleteUser,
  findAll,
  findById,
  insertUser,
  updateUser,
} from "../services/user_service.js";
const router = Router();

router.get("/users", findAll);
router.get("/users/id/:id_user", findById);
router.post("/users", insertUser);
router.patch("/users/:id_user", updateUser);
router.delete("/users/:id_user", deleteUser);

export default router;
