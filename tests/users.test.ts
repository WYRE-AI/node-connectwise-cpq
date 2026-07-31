import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../src/index.js';
import { userFixture } from './fixtures/cpq.js';
import { BASE, makeClient, respondWithError } from './helpers.js';
import { server } from './mocks/server.js';

const client = makeClient();

describe('users', () => {
  it('lists users from the non-/api settings prefix', async () => {
    let path = '';
    server.use(
      http.get(`${BASE}/settings/user`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json([userFixture]);
      })
    );
    expect(await client.users.list()).toEqual([userFixture]);
    expect(path).toBe('/settings/user');
  });

  describe('error paths', () => {
    it('401 → AuthenticationError', async () => {
      respondWithError('get', '/settings/user', 401);
      await expect(client.users.list()).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('404 → NotFoundError', async () => {
      respondWithError('get', '/settings/user', 404);
      await expect(client.users.list()).rejects.toBeInstanceOf(NotFoundError);
    });

    it('429 → RateLimitError', async () => {
      respondWithError('get', '/settings/user', 429);
      await expect(client.users.list()).rejects.toBeInstanceOf(RateLimitError);
    });

    it('500 → ServerError (also what missing auth produces upstream)', async () => {
      respondWithError('get', '/settings/user', 500);
      await expect(client.users.list()).rejects.toBeInstanceOf(ServerError);
    });
  });
});
