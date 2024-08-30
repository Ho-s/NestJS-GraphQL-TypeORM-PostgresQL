import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { v4 } from 'uuid';

@Injectable()
export class UtilService {
  constructor(private readonly configService: ConfigService) {}

  getNumber(key: string): number {
    const value = this.configService.get<string>(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  getString(key: string): string {
    const value = this.configService.get<string>(key);

    return value.replace(/\\n/g, '\n');
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  pick<T extends object, K extends keyof T>(instance: T, keys: K[]) {
    return keys.reduce(
      (picked, key) => {
        if (key in instance) {
          picked[key] = instance[key];
        }

        return picked;
      },
      {} as Pick<T, K>,
    );
  }

  get getRandomUUID() {
    return v4();
  }

  get nodeEnv() {
    return this.getString('NODE_ENV') as 'development' | 'production' | 'test';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}
