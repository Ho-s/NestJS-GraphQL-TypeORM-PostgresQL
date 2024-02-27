import { ExtendedRepository } from 'src/common/graphql/customExtended';

import { CustomRepository } from '../common/decorators/typeorm.decorator';
import { User } from './entities/user.entity';

@CustomRepository(User)
export class UserRepository extends ExtendedRepository<User> {}
