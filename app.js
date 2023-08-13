const express = require("express");

const app = express();
app.use(express.json());

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const databasePath = path.join(__dirname, "moviesData.db");

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertMovieNameToPascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const getAllMovieQuery = `
        SELECT
        movie_name
        FROM
        movie;`;

  const moviesArray = await database.all(getAllMovieQuery);
  response.send(
    moviesArray.map((movieName) => convertMovieNameToPascalCase(movieName))
  );
});

//API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
INSERT INTO
movie(director_id,movie_name,lead_actor)
VALUES
(${directorId},'${movieName}','${leadActor}');`;

  const dbResponse = await database.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
  };
};

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * 
FROM 
movie
WHERE 
movie_id = ${movieId};`;

  const movie = await database.get(getMovieQuery);
  console.log(movieId);
  response.send(convertDbObjectToResponseObject(movie));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;
  const updatedMovieQuery = `
UPDATE
movie
SET 
director_id = "${directorId}",
movie_name = "${movieName}",
lead_actor = "${leadActor}"
WHERE 
movie_id = ${movieId};`;

  await database.run(updatedMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
DELETE FROM
movie
WHERE
movie_id =${movieId};`;

  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDirectorDetailsPascalCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getAllDirectorQuery = `
SELECT
*
FROM
director;`;
  const moviesArray = await database.all(getAllDirectorQuery);
  response.send(
    moviesArray.map((director) => convertDirectorDetailsPascalCase(director))
  );
});

const convertMovieNamePascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getDirectorMovieQuery = `
SELECT
movie_name
FROM
director
INNER JOIN
movie ON director.director_id =movie.director_id
WHERE 
director.director_id = ${directorId};`;

  const movies = await database.all(getDirectorMovieQuery);
  console.log(directorId);
  response.send(
    movies.map((movieName) => convertMovieNameToPascalCase(movieName))
  );
});

module.exports = app;
