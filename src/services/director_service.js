import { pool } from "../../database.js";

export const findAll = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT name,nationality,birth_date,birth_place FROM directors WHERE is_active = 1"
    );
    if (result.length === 0) {
      return res.status(404).json(result);
    } else {
      return res.json(result);
    }
  } catch (err) {
    console.log(err);
    return handleException(res, err.mysqlMessage);
  }
};

export const insertDirector = async (req, res) => {
  try {
    const { name, nationality, birth_date, birth_place } = req.body;
    const [result] = await pool.query(
      "INSERT INTO directors (name,nationality,birth_date,birth_place) VALUES (?,?,?,?)",
      [name, nationality, birth_date, birth_place]
    );
    if (result.affectedRows > 0) {
      return res.status(201).json({ message: "Director agregado" });
    } else {
      return res.status(400).json({ message: `El director no fue agregado` });
    }
  } catch (err) {
    console.log(err);
    return handleException(res, err.mysqlMessage);
  }
};

export const updateDirector = async (req, res) => {
  try {
    const { id_director } = req.params;
    const { name, nationality, birth_date, birth_place } = req.body;
    const [existDirector] = await pool.query(
      "SELECT * FROM directors WHERE id_director = ?",
      [id_director]
    );
    if (existDirector.length === 0) {
      return res
        .status(404)
        .json({ message: "El director no existe en la base de datos" });
    } else {
      const [result] = await pool.query(
        "UPDATE directors SET name = IFNULL(?,name), nationality = IFNULL(?,nationality), birth_date = IFNULL(?,birth_date), birth_place = IFNULL(?,birth_place) WHERE id_director = ?",
        [name, nationality, birth_date, birth_place, id_director]
      );
      if (result.affectedRows > 0) {
        return res.json({ message: "Director actualizado" });
      } else {
        return res.status(404).json({ message: `El director no existe` });
      }
    }
  } catch (err) {
    console.log(err);
    return handleException(res, err.mysqlMessage);
  }
};

export const deleteDirector = async (req, res) => {
  try {
    const { id_director } = req.params;
    const [existDirector] = await pool.query(
      "SELECT * FROM directors WHERE id_director = ?",
      [id_director]
    );
    if (existDirector.length === 0) {
      return res.status(404).json({ message: "El director no existe en la base de datos" });
    } else {
      const [result] = await pool.query(
        "UPDATE directors SET is_active = 0 WHERE id_director = ?",
        [id_director]
      );
      if (result.affectedRows > 0) {
        return res.json({ message: "Director eliminado" });
      } else {
        return res.status(404).json({ message: `El director no existe` });
      }
    }
  } catch (err) {
    console.log(err);
    return handleException(res, err.mysqlMessage);
  }
};

const handleException = (res, errorType) => {
  console.error(errorType);
  return res.status(500).json({ errorMessage: "Error interno del servidor." });
};
