import Express, { Request as ExpressRequest, Response } from "express";
import Request from "./utils/request";

import dotenv from "dotenv";
import { CreditResults, Credits, Crew, Movie, MovieResults } from "./types/movies";
dotenv.config();

const app = Express();
const port = process.env.PORT || 3000;
const token = process.env.BEARER_TOKEN || "";
const headers: Record<string, string> = {
  "Content-Type": "application/json",
  Authorization: token,
};

const dateOptions: any = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

function compileResults(movies: Movie[], crew: string[][]) {
  const results = [];
  for (let i: number = 0; i < movies.length; i++) {
    results.push({
      name: movies[i].title || movies[i].original_title || "Unknown",
      release_date: new Date(movies[i].release_date).toLocaleDateString(undefined, dateOptions),
      vote_average: movies[i].vote_average,
      editors: crew[i],
    });
  }
  return results;
}

app.get("/", async (req: ExpressRequest, res: Response) => {
  if (!token) {
    console.error("Token is undefined");
    await res.send("BEARER_TOKEN is undefined");
  }

  const url: string = "https://api.themoviedb.org/3/authentication";
  const results: Promise<any> | any = await new Request().get(url, headers);

  await res.send(results);
});

app.get("/api/movies/:year", async (req: ExpressRequest, res: Response) => {
  if (!token) {
    console.error("BEARER_TOKEN is undefined");
    await res.send("BEARER_TOKEN is undefined");
  }

  let year: string | number = new Date().getFullYear();
  try {
    if (req.params.year && parseInt(req.params.year) >= 1700 && parseInt(req.params.year) <= year) 
      year = parseInt(req.params.year);
  } catch (err) {
    console.error(`Year is not a valid integer or year is invalid. Year: ${req.params.year}`);
    await res.send({
      error: {
        message: `Year is not a valid integer or year is invalid. Year: ${req.params.year}`,
      },
    });
  }
  const url: string = `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${1}&primary_release_year=${year}`;
  let movies: MovieResults;
  let sortedMovies: Movie[] = [];

  try {
    movies = await new Request().get(url, headers);
    sortedMovies = movies?.results?.sort((a: Movie, b: Movie) => b.vote_average - a.vote_average);
    try {
      const crew: any[] = [];
      for (let i = 0; i < sortedMovies.length; i++) {
        crew.push(
          new Promise(async (resolve, reject) => {
            try {
              const fetchCredits: Credits = await new Request().get(
                `https://api.themoviedb.org/3/movie/${sortedMovies[i].id}/credits`,
                headers
              );
  
              let editors: Crew[] = [];
  
              if (fetchCredits?.crew)
                editors = fetchCredits.crew.filter(
                  (member: Crew) => member["known_for_department"] === "Editing"
                );
  
              const editorNames: string[] = [];
              for (let j = 0; j < editors.length; j++) {
                editorNames.push(editors[j].name || editors[j].original_name || "Unknown");
              }
  
              resolve(editorNames);
            } catch (err) {
              reject(err);
            }
          })
        );
      }

      const settledCrew = await Promise.allSettled(crew);
      const fulfilledCrewPromises: string[][] = [];
      for (let i = 0; i < settledCrew.length; i++) {
        if (settledCrew[i].status === "fulfilled") {
          fulfilledCrewPromises.push((settledCrew[i] as PromiseFulfilledResult<string[]>).value);
        }
      }

      const results: CreditResults[] = compileResults(sortedMovies, fulfilledCrewPromises);
      await res.send(results);
    } catch (error: any) {
      console.error(error);
      await res.send(error);
    }
  } catch (err) {
    console.error("Failed to get movies initial request");
    await res.send({
      error: {
        message: "Failed to get movies initial request",
        url,
      },
    });
  }
});

app.get("/api/all-movies/:year", async (req: ExpressRequest, res: Response) => {
  if (!token) {
    console.error("BEARER_TOKEN is undefined");
    await res.send("BEARER_TOKEN is undefined");
  }

  let year: string | number = new Date().getFullYear();
  try {
    if (req.params.year && parseInt(req.params.year) >= 1700 && parseInt(req.params.year) <= year) 
      year = parseInt(req.params.year);
  } catch (err) {
    console.error(`Year is not a valid integer or year is invalid. Year: ${req.params.year}`);
    await res.send({
      error: {
        message: `Year is not a valid integer or year is invalid. Year: ${req.params.year}`,
      },
    });
  }
  const url: string = `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${1}&primary_release_year=${year}`;
  const pages: number[] = [];

  let movies: MovieResults;
  try {
    movies = await new Request().get(url, headers);
    for (let i: number = 0; i < movies?.total_pages; i++) {
      pages.push(i + 1);
    }
  } catch (err) {
    console.error("Failed to get movies initial request");
    await res.send({
      error: {
        message: "Failed to get movies initial request",
        url,
      },
    });
  }

  try {
    const allMovies: any[] = [];
    for (let i = 0; i < pages.length; i++) {
      allMovies.push(
        new Promise(async (resolve, reject) => {
          try {
            const collection: MovieResults = await new Request().get(
              `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${pages[i]}&primary_release_year=${year}`,
              headers
            );
            resolve(collection.results);
          } catch (err) {
            reject(err);
          }
        })
      );
    }

    const settledMovies = await Promise.allSettled(allMovies);
    const fulfilledMoviesPromises: Movie[] = [];
    for (let i = 0; i < settledMovies.length; i++) {
      if (settledMovies[i].status === "fulfilled") {
        fulfilledMoviesPromises.push(...(settledMovies[i] as PromiseFulfilledResult<Movie[]>).value);
      }
    }

    const sortedMovies: Movie[] = fulfilledMoviesPromises.sort(
      (a, b) => b.vote_average - a.vote_average
    );

    const crew: any[] = [];
    for (let i = 0; i < sortedMovies.length; i++) {
      crew.push(
        new Promise(async (resolve, reject) => {
          try {
            const fetchCredits: Credits = await new Request().get(
              `https://api.themoviedb.org/3/movie/${sortedMovies[i].id}/credits`,
              headers
            );
            let editors: Crew[] = [];
  
            if (fetchCredits?.crew)
              editors = fetchCredits.crew.filter(
                (member: Crew) => member["known_for_department"] === "Editing"
              );
    
            const editorNames: string[] = [];
            for (let j = 0; j < editors.length; j++) {
              editorNames.push(editors[j].original_name || editors[j].name);
            }
  
            resolve(editorNames);
          } catch (error: any) {
            console.error(error);
            reject(error);
          }
        })
      );
    }

    const settledCrew = await Promise.allSettled(crew);
    const fulfilledCrewPromises: string[][] = [];
    for (let i = 0; i < settledCrew.length; i++) {
      if (settledCrew[i].status === "fulfilled") {
        fulfilledCrewPromises.push((settledCrew[i] as PromiseFulfilledResult<string[]>).value);
      }
    }

    const results: CreditResults[] = compileResults(fulfilledMoviesPromises, fulfilledCrewPromises);
    await res.send(results);
  } catch (error: any) {
    console.error(error);
    if (error.message.indexOf("Rejected") > -1)
      if (error.message.indexOf("all movies") > -1)
        await res.send({ error: { message: "Failed one or more requests to get all movies" } });
      else if (error.message.indexOf("all credits") > -1)
        await res.send({ error: { message: "Failed one or more requests to get all credits" } });
      else await res.send({ error });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
