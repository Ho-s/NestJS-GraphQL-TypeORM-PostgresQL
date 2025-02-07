declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    PORT: string;
    JWT_PRIVATE_KEY: string;
    JWT_PUBLIC_KEY: string;
    AWS_S3_ACCESS_KEY: string;
    AWS_S3_SECRET_KEY: string;
    AWS_S3_REGION: string;
    AWS_S3_BUCKET_NAME: string;
  }
}
