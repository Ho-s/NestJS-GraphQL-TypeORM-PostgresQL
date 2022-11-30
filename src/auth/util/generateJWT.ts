import { pick } from 'lodash';
import { signJwt } from './jwt.util';
import { User } from '../../entities';

export const generateJWT = (user: User) => {
  const picked = pick(user, ['id', 'role']);
  return signJwt(picked);
};
