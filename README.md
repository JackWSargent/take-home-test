# Take Home Test 

### By Jack Sargent

## Install Node Modules

```bash
npm install
```

## Run Development Server

Make a .env file and add
```
PORT=3000
BEARER_TOKEN=""
```

```bash
npm run dev
```

## Run Tests
Run Development Server First
```bash
npm run dev
```
Then Run Jest Tests
```bash
npm test
```

## Build and Start Server 

```bash
npm run build
npm start
```

## Routes

### http://localhost:{port}/api/movies/{year}

Gets movies from that year with the name, release date, vote average, and editors from page 1.

### http://localhost:{port}/api/all-movies/{year}

Gets all movies from that year. I was getting throttled I think trying to request 60k+ requests at a time. I could use a websocket and request a certain number of pages of movies (credits) at a time but that would take a really long time. There is no api request that could batch all these requests into one or a few requests.