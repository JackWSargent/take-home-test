import {beforeAll, describe, expect, test} from '@jest/globals';

describe('Unit Testing for some Movies', () => {
    let results: any = undefined;
    beforeAll(async () => {
        results = await fetch(`http://localhost:3000/api/movies/1998`, {
            method: "GET",
        }).then(res => res.json());
    })
    test('Expect results to be not null', () => {
        expect(results).toBeDefined();
    });
    test('Expect second entry to be Saving Private Ryan', () => {
        expect(results[1].name).toBe('Saving Private Ryan')
    })
    test('Expect length of results to be 20', () => {
        expect(results.length).toBe(20);
    })
});

describe('Unit Testing for all Movies', () => {
    let results: any = undefined;
    beforeAll(async () => {
        results = await fetch(`http://localhost:3000/api/all-movies/1998`, {
            method: "GET",
        }).then(res => res.json());
    }, 30000);
    test('Expect results to be not null', () => {
        expect(results).toBeDefined();
    }, 30000);
    test('Expect first couple of movies to have a high vote average', () => {
        expect(results[0].vote_average).toBe(10);
    }, 30000);
});