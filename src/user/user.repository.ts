import { CustomRepository } from '../modules/decorators/typeorm.decorator';
import { User } from './entities/user.entity';
import { ExtendedRepository } from 'src/declare/declare.module';

@CustomRepository(User)
export class UserRepository extends ExtendedRepository<User> {}
