const express = require("express");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const ConvertMovieDbToResponseDbObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const ConvertDirectorDbToResponseDbObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
        movie_name
    FROM 
        movie;
    `;
  const movieArray = await db.all(getMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesQuery = `
    SELECT
        *
    FROM 
        movie
    WHERE
        movie_id = ${movieId};
    `;
  const movie = await db.all(getMoviesQuery);
  response.send(ConvertMovieDbToResponseDbObject(movie));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const getMoviesQuery = `
    INSERT INTO 
        movie (director_id, movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');
    `;
  await db.run(getMoviesQuery);
  response.send("Movie Successfully Added");
});

app.post("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMoviesQuery = `
    UPDATE 
        movie
    SET 
    director_id = ${directorId},
    movie_name =  '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};
    `;
  await db.run(updateMoviesQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const DeleteMoviesQuery = `
    DELETE
    FROM 
        movie
    WHERE
        movie_id = ${movieId};
    `;
  await db.run(DeleteMoviesQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT
        *
    FROM 
        director;
    `;
  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      ConvertDirectorDbToResponseDbObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
    SELECT
        movie_name
    FROM 
        movie
    WHERE
        director_id = '${directorId}';
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
