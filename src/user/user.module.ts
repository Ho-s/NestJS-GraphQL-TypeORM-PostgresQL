import { TypeOrmExModule } from '../common/modules/typeorm.module';
import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([UserRepository])],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
