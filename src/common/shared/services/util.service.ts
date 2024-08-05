import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
