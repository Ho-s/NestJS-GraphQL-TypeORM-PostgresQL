import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  DeleteObjectCommand,
  ListObjectsCommand,
  S3,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import type { FileUpload } from 'graphql-upload/processRequest.mjs';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';

import { CustomBadRequestException } from 'src/common/exceptions';
import { EnvironmentVariables } from 'src/common/helper/env.validation';

@Injectable()
export class UploadService {
  private readonly awsS3: S3;
  public readonly S3_BUCKET_NAME: string;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService,
  ) {
    this.awsS3 = new S3({
      region: this.configService.get('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      },
    });
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  }

  getLinkByKey(key: string) {
    return `https://${this.configService.get(
      'AWS_S3_BUCKET_NAME',
    )}.s3.amazonaws.com/${key}`;
  }

  async uploadFileToS3({
    folderName,
    file,
  }: {
    folderName: string;
    file: FileUpload;
  }) {
    const key = `${folderName}/${new Date().toISOString()}_${path.basename(
      file.filename,
    )}`.replace(/ /g, '');

    const upload = new Upload({
      client: this.awsS3,
      params: {
        Bucket: this.S3_BUCKET_NAME,
        Key: key,
        Body: file.createReadStream(),
        ContentType: file.mimetype,
      },
    });

    try {
      await upload.done();

      return { key };
    } catch (error) {
      throw new CustomBadRequestException({
        message: `File upload failed : ${error}`,
      });
    }
  }

  async deleteS3Object(key: string): Promise<{ success: true }> {
    const command = new DeleteObjectCommand({
      Bucket: this.S3_BUCKET_NAME,
      Key: key,
    });

    const check = new ListObjectsCommand({
      Bucket: this.S3_BUCKET_NAME,
      Prefix: key,
    });

    const fileList = await this.awsS3.send(check);

    if (!fileList.Contents || fileList.Contents.length === 0) {
      throw new CustomBadRequestException({ message: `File does not exist` });
    }

    try {
      await this.awsS3.send(command);
      return { success: true };
    } catch (error) {
      throw new CustomBadRequestException({
        message: `Failed to delete file : ${error}`,
      });
    }
  }

  async listS3Object(folder: string) {
    const command = new ListObjectsCommand({
      Bucket: this.S3_BUCKET_NAME,
      Prefix: folder,
    });

    const data = await this.awsS3.send(command);

    const promise = await Promise.all(
      data.Contents.map(async (v) => {
        const url = this.getLinkByKey(v.Key);

        const data = await firstValueFrom(this.httpService.get(url));
        return data;
      }),
    );

    return promise.map((v) => v.data);
  }
}
