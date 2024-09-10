import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum NODE_ENVIRONMENT {
  development,
  production,
  test,
}

export class EnvironmentVariables {
  @IsEnum(NODE_ENVIRONMENT)
  NODE_ENV: keyof typeof NODE_ENVIRONMENT;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsNotEmpty()
  DB_PORT: number;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  JWT_PRIVATE_KEY: string;

  @IsString()
  @IsNotEmpty()
  JWT_PUBLIC_KEY: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_PRIVATE_KEY: string;

  @IsString()
  @IsOptional()
  AWS_S3_ACCESS_KEY?: string;

  @IsString()
  @IsOptional()
  AWS_S3_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  AWS_S3_REGION?: string;

  @IsString()
  @IsOptional()
  AWS_S3_BUCKET_NAME?: string;
}

export function envValidation(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
