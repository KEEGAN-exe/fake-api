import { pool } from "../../database.js";

export const findAll = async (req, res) => {
  try {
    const query = `
    SELECT
      m.id_movie,
      m.title,
      m.duration,
      DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
      m.country,
      m.production_company,
      m.poster_image,
      m.trailer_video,
      m.sinopsis,
      JSON_OBJECT(
        'id_director', d.id_director,
        'name', d.name,
        'nationality', d.nationality,
        'birth_date', DATE_FORMAT(d.birth_date, '%Y-%m-%d'),
        'birth_place', d.birth_place
      ) AS director,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id_genre', g.id_genre,
          'name', g.name
        )
      ) AS genres
    FROM
      movies m
      JOIN directors d ON m.id_director = d.id_director
      LEFT JOIN movie_genre mg ON m.id_movie = mg.id_movie
      LEFT JOIN genres g ON mg.id_genre = g.id_genre
    WHERE m.active = true
    GROUP BY
      m.id_movie`;

    const [result] = await pool.query(query);
    return res.json(result);
  } catch (error) {
    return handleException(res, error);
  }
};

export const findById = async (req, res) => {
  try {
    const { id_movie } = req.params;
    const [result] = await pool.query(
      `SELECT
      m.id_movie,
      m.title,
      m.duration,
      DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
      m.country,
      m.production_company,
      m.poster_image,
      m.trailer_video,
      m.sinopsis,
      JSON_OBJECT(
        'id_director', d.id_director,
        'name', d.name,
        'nationality', d.nationality,
        'birth_date', DATE_FORMAT(d.birth_date, '%Y-%m-%d'),
        'birth_place', d.birth_place
      ) AS director,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id_genre', g.id_genre,
          'name', g.name
        )
      ) AS genres
    FROM
      movies m
      JOIN directors d ON m.id_director = d.id_director
      LEFT JOIN movie_genre mg ON m.id_movie = mg.id_movie
      LEFT JOIN genres g ON mg.id_genre = g.id_genre
    WHERE m.active = true AND m.id_movie = ?
    GROUP BY
      m.id_movie`,
      [id_movie]
    );
    if (result.length === 0) {
      return res.status(404).json(result);
    } else {
      return res.json(result[0]);
    }
  } catch (error) {
    return handleException(res, error);
  }
};

export const findByTitle = async (req, res) => {
  try {
    const { title } = req.params;
    const [result] = await pool.query(`SELECT
    m.id_movie,
    m.title,
    m.duration,
    DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
    m.country,
    m.production_company,
    m.poster_image,
    m.trailer_video,
    m.sinopsis,
    JSON_OBJECT(
      'id_director', d.id_director,
      'name', d.name,
      'nationality', d.nationality,
      'birth_date', DATE_FORMAT(d.birth_date, '%Y-%m-%d'),
      'birth_place', d.birth_place
    ) AS director,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id_genre', g.id_genre,
        'name', g.name
      )
    ) AS genres
  FROM
    movies m
    JOIN directors d ON m.id_director = d.id_director
    LEFT JOIN movie_genre mg ON m.id_movie = mg.id_movie
    LEFT JOIN genres g ON mg.id_genre = g.id_genre
  WHERE m.active = true AND m.title LIKE "${title}%"
  GROUP BY
    m.id_movie`);
    if (result.length === 0) {
      return res.status(404).json(result);
    } else {
      return res.json(result);
    }
  } catch (error) {
    return handleException(res, error);
  }
};

export const insertMovie = async (req, res) => {
  try {
    const {
      title,
      duration,
      release_date,
      country,
      production_company,
      poster_image,
      trailer_video,
      sinopsis,
      id_director,
      genres,
    } = req.body;

    const [genreCheck] = await pool.query(
      "SELECT * FROM genres WHERE id_genre IN (?)",
      [genres]
    );

    if (genreCheck.length !== genres.length) {
      return res
        .status(400)
        .json({ error: "Uno o más id de género no son válidos" });
    }

    const [directorCheck] = await pool.query(
      "SELECT * FROM directors WHERE id_director = ?",
      [id_director]
    );

    if (directorCheck.length === 0) {
      return res
        .status(400)
        .json({ error: "El id del director proporcionado no es válido" });
    }

    const currentDate = new Date();
    const movieReleaseDate = new Date(release_date);

    if (movieReleaseDate > currentDate) {
      return res
        .status(400)
        .json({ message: "La fecha de lanzamiento no puede ser en el futuro" });
    }

    const maxAllowedReleaseYear = currentDate.getFullYear() - 80;
    const movieReleaseYear = movieReleaseDate.getFullYear();

    if (movieReleaseYear < maxAllowedReleaseYear) {
      return res.status(400).json({
        message: "Fecha de lanzamiento no válida. Demasiado antigua.",
      });
    }

    const [resultMovies] = await pool.query(
      "INSERT INTO movies (title, duration, release_date, country, production_company, poster_image, trailer_video, sinopsis, id_director) VALUES (?,?,DATE(?),?,?,?,?,?,?)",
      [
        title,
        duration,
        release_date,
        country,
        production_company,
        poster_image,
        trailer_video,
        sinopsis,
        id_director,
      ]
    );

    if (resultMovies && resultMovies.insertId) {
      const movieId = resultMovies.insertId;

      const insertGenrePromises = genres.map(async (id_genre) => {
        const [secondResult] = await pool.query(
          "INSERT INTO movie_genre (id_movie, id_genre) VALUES (?,?)",
          [movieId, id_genre]
        );

        return secondResult.affectedRows > 0;
      });

      const results = await Promise.all(insertGenrePromises);

      if (results.every((result) => result)) {
        return res.status(201).json({ message: "Película registrada" });
      } else {
        return res
          .status(400)
          .json({ message: "La película no fue registrada correctamente" });
      }
    }
  } catch (error) {
    return handleException(res, error);
  }
};

export const updateMovie = async (req, res) => {
  try {
    const { id_movie } = req.params;
    const {
      genres,
      title,
      duration,
      release_date,
      country,
      production_company,
      poster_image,
      trailer_video,
      sinopsis,
      id_director,
    } = req.body;

    const [existingMovie] = await pool.query(
      "SELECT * FROM movies WHERE id_movie = ?",
      [id_movie]
    );

    if (existingMovie.length === 0) {
      return res.status(404).json({ error: "La película no existe" });
    }

    const currentDate = new Date();
    const movieReleaseDate = new Date(release_date);

    if (movieReleaseDate > currentDate) {
      return res
        .status(400)
        .json({ message: "La fecha de lanzamiento no puede ser en el futuro" });
    }

    const maxAllowedReleaseYear = currentDate.getFullYear() - 80;
    const movieReleaseYear = movieReleaseDate.getFullYear();

    if (movieReleaseYear < maxAllowedReleaseYear) {
      return res.status(400).json({
        message: "Fecha de lanzamiento no válida. Demasiado antigua.",
      });
    }

    if (genres !== undefined && genres.length > 0) {
      await pool.query("DELETE FROM movie_genre WHERE id_movie = ?", [
        id_movie,
      ]);
      const insertGenrePromises = genres.map(async (id_genre) => {
        await pool.query(
          "INSERT INTO movie_genre (id_movie, id_genre) VALUES (?, ?)",
          [id_movie, id_genre]
        );
      });

      await Promise.all(insertGenrePromises);
    }

    await pool.query(
      `
      UPDATE movies
      SET
        title = COALESCE(?, title),
        duration = COALESCE(?, duration),
        release_date = COALESCE(?, release_date),
        country = COALESCE(?, country),
        production_company = COALESCE(?, production_company),
        poster_image = COALESCE(?, poster_image),
        trailer_video = COALESCE(?, trailer_video),
        sinopsis = COALESCE(?, sinopsis),
        id_director = COALESCE(?, id_director)
      WHERE id_movie = ?
      `,
      [
        title,
        duration,
        release_date,
        country,
        production_company,
        poster_image,
        trailer_video,
        sinopsis,
        id_director,
        id_movie,
      ]
    );

    return res.json({ message: "Película actualizada exitosamente" });
  } catch (error) {
    return handleException(res, error);
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const { id_movie } = req.params;
    const [result] = await pool.query(
      "UPDATE movies SET active = false WHERE id_movie = ?",
      [id_movie]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "La pelicula no existe en la base de datos" });
    } else {
      return res.json({ message: "Pelicula eliminada" });
    }
  } catch (error) {
    return handleException(res, error);
  }
};

const handleException = (res, errorType) => {
  console.log(errorType);
  return res.status(500).json({ errorMessage: "Error interno del servidor." });
};
