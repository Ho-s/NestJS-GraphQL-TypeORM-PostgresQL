import { Injectable } from '@nestjs/common';

import { FindOptionsWhere } from 'typeorm';

import { CustomCache } from 'src/cache/custom-cache.decorator';
import { OneRepoQuery, RepoQuery } from 'src/common/graphql/types';

import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './inputs/user.input';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  @CustomCache({ logger: console.log, ttl: 1000 })
  getMany(option?: RepoQuery<User>) {
    return this.userRepository.getMany(option);
  }

  getOne(option: OneRepoQuery<User>) {
    return this.userRepository.getOne(option);
  }

  doesExist(where: FindOptionsWhere<User>) {
    return this.userRepository.exists({ where });
  }

  create(input: CreateUserInput): Promise<User> {
    const user = this.userRepository.create(input);

    return this.userRepository.save(user);
  }

  update(id: string, input: UpdateUserInput) {
    const user = this.userRepository.create(input);

    return this.userRepository.update(id, user);
  }

  delete(id: string) {
    return this.userRepository.delete({ id });
  }
}
