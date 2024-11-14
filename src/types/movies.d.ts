export type MovieResults = {
    page: number,
    results: Movie[],
    total_pages: number,
    total_results: number,
}

export type Movie = {
    adult?: boolean,
    backdrop_path?: string,
    genre_ids?: number[],
    id: number,
    original_language: string,
    original_title?: string,
    overview?: string,
    popularity: number,
    poster_path?: string,
    release_date: string,
    title: string,
    video?: boolean,
    vote_average: number,
    vote_count?: number,
}

export type Credits = {
    id: number,
    cast?: Cast[],
    crew?: Crew[],
}

export type Cast = {
    adult?: boolean, 
    gender?: number,
    id: number,
    known_for_department?: string,
    name?: string,
    original_name?: string,
    popularity: number,
    profile_path?: string,
    cast_id?: number,
    character?: string,
    credit_id?: string,
    order?: number, 
}

export type Crew = {
    adult?: boolean, 
    gender?: number,
    id: number,
    known_for_department?: string,
    name: string,
    original_name?: string,
    popularity: number,
    profile_path?: string,
    credit_id?: string,
    department?: string,
    job?: string,
    status?: string,
    value?: string[],
}

export type CreditResults = {
    name: string,
    release_date: string,
    vote_average: number,
    editors: string[],
}