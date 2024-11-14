import {beforeAll, describe, expect, test} from '@jest/globals';

describe('Unit Testing', () => {
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