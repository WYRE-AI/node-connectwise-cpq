import type { HttpClient } from '../http.js';
import { unwrap, type CpqListParams } from '../pagination.js';
import type { UserView } from '../types/user.js';

/** CPQ users (API users, approvers, admins). Note the non-`/api` prefix. */
export class UsersResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: CpqListParams): Promise<UserView[]> {
    const payload = await this.http.request<unknown>('/settings/user', { params: { ...params } });
    return unwrap<UserView>(payload);
  }
}
