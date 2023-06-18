import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HttpHealthIndicator,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class PingIndicator extends HealthIndicator {
  constructor(private http: HttpHealthIndicator) {
    super();
  }

  async isHealthy(key: string, url: string): Promise<HealthIndicatorResult> {
    try {
      await this.http.pingCheck(key, url);
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('failed', error.causes);
    }
  }
}
