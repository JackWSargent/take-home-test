import Express, { Request as ExpressRequest, Response } from 'express';
import Request from "./utils/request";

import dotenv from 'dotenv';
dotenv.config();

const app = Express();
const port = process.env.PORT || 3000;
const token = process.env.BEARER_TOKEN || "";
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: token,
}

app.get('/', async (req: ExpressRequest, res: Response) => {

  if (!token) console.log("Token is undefined");

  const url = 'https://api.themoviedb.org/3/authentication';

  const result = await new Request().get(url, headers);

  await res.send(result)

});

app.get('/api/movies/:year', async (req: ExpressRequest, res: Response) => {
  const year = req.params.year ? req.params.year : new Date().getFullYear();
  const url = `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${1}&primary_release_year=${year}`
  // const movies: any = await getAllMovies(year, 1, []);
  const movies: any = await new Request().get(url, headers);

  const sortedMovies = movies.results.sort((a: any, b: any) => b.vote_average - a.vote_average)

  const crew = await Promise.all(sortedMovies.map((movie: any) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!movie?.id) resolve([]);
        const fetchCredits = await new Request().get(`https://api.themoviedb.org/3/movie/${movie.id}/credits`, headers);
        let editors = [];
        if (fetchCredits?.crew)
          editors = fetchCredits.crew.filter((member: any) => member["known_for_department"] === "Editing");

        const editorNames = editors.map((editor: any) => {
          return editor.original_name;
        })

        resolve(editorNames);
      } catch (err) {
        reject(err);
      }
    }) 
  }))
  const options: any = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const result = sortedMovies.map((movie: any, idx: number) => {
    return {
      name: movie.original_title,
      release_date: new Date(movie.release_date).toLocaleDateString(undefined, options),
      vote_average: movie.vote_average,
      editors: crew[idx],
    }
  })

  await res.send(result);
});

app.get('/api/all-movies/:year', async (req: ExpressRequest, res: Response) => {
  const year = req.params.year ? req.params.year : new Date().getFullYear();
  const url = `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${1}&primary_release_year=${year}`
  // const movies: any = await getAllMovies(year, 1, []);
  const movies: any = await new Request().get(url, headers);
  const pages = [];
  for(let i: number = 0; i < movies.total_pages; i++) {
    pages.push(i + 1);
  }
  const allMovies = await Promise.all(pages.map((page => {
    return new Promise(async (resolve, reject) => { 
      try {
        const collection: any = await new Request().get(`https://api.themoviedb.org/3/discover/movie?language=en-US&page=${page}&primary_release_year=${year}`, headers);
        resolve(collection.results); 
      } catch (err) {
        reject(err);
      }
    })
  })))

  const sortedMovies = allMovies.flat().sort((a: any, b: any) => b.vote_average - a.vote_average)
  console.log(sortedMovies[0])

  const crew = await Promise.all(sortedMovies.map((movie: any) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!movie?.id) resolve([]);
        const fetchCredits = await new Request().get(`https://api.themoviedb.org/3/movie/${movie.id}/credits`, headers);
        let editors = [];
        if (fetchCredits?.crew)
          editors = fetchCredits.crew.filter((member: any) => member["known_for_department"] === "Editing");

        const editorNames = editors.map((editor: any) => {
          return editor.original_name;
        })

        resolve(editorNames);
      } catch (err) {
        reject(err);
      }
    }) 
  }))
  const options: any = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const result = sortedMovies.map((movie: any, idx: number) => {
    return {
      name: movie.original_title,
      release_date: new Date(movie.release_date).toLocaleDateString(undefined, options),
      vote_average: movie.vote_average,
      editors: crew[idx],
    }
  })

  await res.send(result);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});