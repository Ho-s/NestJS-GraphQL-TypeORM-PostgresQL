import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { OneRepoQuery, RepoQuery } from 'src/common/graphql/types';
import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './inputs/user.input';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  getMany(qs: RepoQuery<User> = {}, gqlQuery?: string) {
    return this.userRepository.getMany(qs, gqlQuery);
  }

  getOne(qs: OneRepoQuery<User>, gqlQuery?: string) {
    return this.userRepository.getOne(qs, gqlQuery);
  }

  create(input: CreateUserInput): Promise<User> {
    return this.userRepository.save(Object.assign(new User(), input));
  }

  createMany(input: CreateUserInput[]): Promise<User[]> {
    return this.userRepository.save(input);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    return this.userRepository.save({ ...user, ...input });
  }

  async delete(id: string) {
    const { affected } = await this.userRepository.delete({ id });
    return { status: affected > 0 ? 'success' : 'fail' };
  }
}
