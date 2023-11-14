import { CustomRepository } from '../common/decorators/typeorm.decorator';
import { User } from './entities/user.entity';
import { ExtendedRepository } from 'src/common/graphql/customExtended';

@CustomRepository(User)
export class UserRepository extends ExtendedRepository<User> {}
