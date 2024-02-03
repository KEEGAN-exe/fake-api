import { Router } from "express";
import { autenticarUsuario, refreshAccessToken } from "../services/auth_service.js";

const router = Router();

router.post("/login", autenticarUsuario);
router.post("/refresh", refreshAccessToken)

export default router;
