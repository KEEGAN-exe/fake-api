import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findByUsername } from "./user_service.js";
import dotenv from "dotenv";
dotenv.config();

const secretKey = process.env.SECRET_KEY;

const generarTokens = (usuario) => {
  const accessToken = jwt.sign({ usuario }, secretKey, { expiresIn: "1m" });
  const refreshToken = jwt.sign({ usuario }, secretKey, { expiresIn: "2m" });

  return { accessToken, refreshToken };
};

export const autenticarUsuario = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await findByUsername({ username });
    const passwordCheck =
      user === null ? false : await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res.status(401).json({ error: "Invalid user or password" });
    }

    const usuario = { username };

    const token = generarTokens(usuario);
    return res.json({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });
  } catch (error) {
    console.log(error);
  }
};

export const verificarToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ mensaje: "Acceso no autorizado. Token no proporcionado." });
  }

  const tokenSinBearer = token.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(tokenSinBearer, secretKey);
    req.usuario = decoded.usuario;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: "Token no válido." });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token not provided" });
    }

    const decoded = jwt.verify(refreshToken, secretKey);
    const usuario = decoded.usuario;
    const newAccessToken = jwt.sign({ usuario }, secretKey, { expiresIn: "10s" });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};