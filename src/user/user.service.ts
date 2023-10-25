import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { OneRepoQuery, RepoQuery } from 'src/declare/types';
import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './inputs/user.input';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  getOne(qs: OneRepoQuery<User>, query?: string) {
    return this.userRepository.getOne(qs, query);
  }

  getMany(qs: RepoQuery<User> = {}, query?: string) {
    return this.userRepository.getMany(qs, query);
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
