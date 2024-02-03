import { pool } from "../../database.js";

export const findAll = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT id_genre, name, image_url, description FROM genres WHERE is_active = 1"
    );
    if (result.length === 0) {
      return res.status(404).json(result);
    } else {
      return res.json(result);
    }
  } catch (err) {
    return handleException(res, err);
  }
};

export const findById = async (req, res) => {
  try {
    const { id_genre } = req.params;
    const [result] = await pool.query(
      "SELECT id_genre, name, image_url, description FROM genres WHERE is_active = 1 AND id_genre = ?",
      [id_genre]
    );
    if (result.length === 0) {
      return res.status(404).json(result);
    } else {
      return res.json(result[0]);
    }
  } catch (error) {
    return handleException(res, err);
  }
};

export const findByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({
        message: 'El parámetro name es obligatorio en la consulta.',
      });
    }
    const [result] = await pool.query(
      `SELECT id_genre, name, image_url, description FROM genres WHERE is_active = 1 AND name LIKE "${name}%" ORDER BY id_genre`
    );
    if (result.length === 0) {
      return res.status(404).json(result);
    } else {
      return res.json(result);
    }
  } catch (error) {
    return handleException(res, req);
  }
};

export const insertGenre = async (req, res) => {
  try {
    const { name, image_url, description } = req.body;
    const [result] = await pool.query(
      "INSERT INTO genres (name,image_url,description) VALUES (?,?,?)",
      [name, image_url, description]
    );
    if (result.affectedRows > 0) {
      return res.status(201).json({ message: "Genero agregado" });
    } else {
      return res.status(400).json({ message: "El genero no fue agregado" });
    }
  } catch (err) {
    return handleException(res, err);
  }
};

export const updateGenre = async (req, res) => {
  try {
    const { id_genre } = req.params;
    const { name, image_url, description } = req.body;
    const [existGenre] = await pool.query(
      "SELECT * FROM genres WHERE id_genre = ?",
      [id_genre]
    );
    if (existGenre.length === 0) {
      return res
        .status(404)
        .json({ message: "El genero no existe en la base de datos" });
    } else {
      const [result] = await pool.query(
        "UPDATE genres SET name = IFNULL(?,name), image_url = IFNULL(?,image_url), description = IFNULL(?,description) WHERE id_genre = ?",
        [name, image_url, description, id_genre]
      );
      if (result.affectedRows > 0) {
        return res.json({ message: "Genero actualizado" });
      } else {
        return res.status(404).json({ message: `El director no existe` });
      }
    }
  } catch (err) {
    return handleException(res, err);
  }
};

export const deleteGenre = async (req, res) => {
  try {
    const { id_genre } = req.params;
    const [existGenre] = await pool.query(
      "SELECT * FROM genres WHERE id_genre = ?",
      [id_genre]
    );
    if (existGenre.length === 0) {
      return res
        .status(404)
        .json({ message: "El genero no existe en la base de datos" });
    } else {
      const [result] = await pool.query(
        "UPDATE genres SET is_active = 0 WHERE id_genre = ?",
        [id_genre]
      );
      if (result.affectedRows > 0) {
        return res.json({ message: "Genero eliminado" });
      } else {
        return res.status(404).json({ message: `El genero no existe` });
      }
    }
  } catch (err) {
    return handleException(res, err);
  }
};

const handleException = (res, errorType) => {
  console.log(errorType);
  return res.status(500).json({ errorMessage: "Error interno del servidor." });
};
