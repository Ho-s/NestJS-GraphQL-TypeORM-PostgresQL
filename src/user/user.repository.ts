import { User } from '../entities';
import { CustomRepository } from '../modules/decorators/typeorm.decorator';
import { Repository } from 'typeorm/repository/Repository';

@CustomRepository(User)
export class UserRepository extends Repository<User> {}
