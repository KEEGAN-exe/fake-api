import { pool } from "../../database.js";
import bycript from "bcrypt";

export const findAll = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT id_user, name, username, password, avatar, DATE_FORMAT(create_date, '%Y-%m-%d') AS create_date FROM users WHERE is_active = true"
    );
    if (result.length === 0) {
      return res.json({ message: "No hay registros" });
    }
    return res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const findById = async (req, res) => {
  try {
    const { id_user } = req.params;
    const [result] = await pool.query(
      "SELECT id_user, name, username, password, avatar, DATE_FORMAT(create_date, '%Y-%m-%d') AS create_date FROM users WHERE id_user = ? AND is_active = true",
      [id_user]
    );
    if (result.length === 0) {
      return res.status(400).json({ message: `El usuario no existe` });
    }

    return res.json(result[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const findByUsername = async ({ username }) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND is_active = true",
      [username]
    );
    if (result.length === 0) {
      return null;
    }
    return result[0];
  } catch (err) {
    console.log(err);
  }
};

export const insertUser = async (req, res) => {
  try {
    const { username, password, name, avatar } = req.body;
    const [userExist] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (userExist.length !== 0) {
      return res
        .status(404)
        .json({ message: "El nombre de usuario ya existe" });
    }
    const hashedPassword = await bycript.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name,username,password,avatar,create_date) VALUES (?,?,?,?,?)",
      [name, username, hashedPassword, avatar, dateGenerate()]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Usuario creado" });
    } else {
      return res.status(400).json({ message: "Error al crear el usuario" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id_user } = req.params;
    const { username, password, name, avatar } = req.body;
    const [userExist] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (userExist.length !== 0) {
      return res
        .status(404)
        .json({ message: "El nombre de usuario ya existe" });
    }
    const [result] = await pool.query(
      "UPDATE users SET name = IFNULL(?,name), username = IFNULL(?,username) , avatar = IFNULL(?,avatar), password = IFNULL(?,password) WHERE id_user = ?",
      [name, username, avatar, password, id_user]
    );
    if (result.affectedRows > 0) {
      return res.json({ message: "Datos actualizados" });
    } else {
      return res.status(400).json({ message: "El usuario no existe" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id_user } = req.params;
    const [checkUser] = await pool.query(
      "SELECT * FROM users WHERE is_active = true AND id_user = ?",
      [id_user]
    );
    if (checkUser.length > 0) {
      const [deleteUser] = await pool.query(
        "UPDATE users SET is_active = false WHERE id_user = ?",
        [id_user]
      );
      return res.json({ message: "usuario eliminado" });
    } else {
      return res.status(400).json({ message: `El usuario no existe` });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

function dateGenerate() {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];
  return formattedDate;
}
