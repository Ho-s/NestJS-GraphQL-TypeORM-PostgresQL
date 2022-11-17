import { pick } from 'lodash';
import { signJwt } from '../auth/util/jwt.util';
import { User } from '../entities';

export const generateJWT = (user: User) => {
  const picked = pick(user, ['id', 'role']);
  return signJwt(picked);
};
