/** CPQ UserView (from `/settings/user` — note the non-`/api` prefix). */
export interface UserView {
  id?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin?: boolean;
  isApprover?: boolean;
  isApiUser?: boolean;
  isDisabled?: boolean;
  createDate?: string;
  modifyDate?: string;
}
