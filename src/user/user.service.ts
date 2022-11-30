import { User, CreateUserInput, UpdateUserInput } from '../entities';
import { OneRepoQuery, RepoQuery } from '../declare/declare.module';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { SignUpInput } from 'src/entities/auth/auth.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  getOne(qs?: OneRepoQuery<User>) {
    return this.userRepository.getOne(qs || {});
  }

  getMany(qs?: RepoQuery<User>) {
    return this.userRepository.getMany(qs || {});
  }

  async create(input: CreateUserInput | SignUpInput): Promise<User> {
    if (input.password) {
      input.password = await bcrypt.hash(input.password, 10);
    }
    return this.userRepository.save(input);
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
