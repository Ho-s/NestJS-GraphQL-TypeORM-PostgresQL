import { S3, AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { ReadStream } from 'fs';
import { FileUpload } from 'graphql-upload';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly awsS3: S3;
  public readonly S3_BUCKET_NAME: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.awsS3 = new S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    });
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  }

  async uploadFileToS3({
    folderName,
    file,
  }: {
    folderName: string;
    file: FileUpload;
  }) {
    const promised = await file;
    const key = `${folderName}/${new Date().toISOString()}_${path.basename(
      promised.filename,
    )}`.replace(/ /g, '');
    try {
      await this.awsS3
        .upload({
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: promised.createReadStream(),
        })
        .promise();

      return { key };
    } catch (error) {
      throw new BadRequestException(`File upload failed : ${error}`);
    }
  }

  async uploadTxtToS3(
    folder: string,
    file: ReadStream,
  ): Promise<{
    key: string;
    s3Object: PromiseResult<S3.PutObjectOutput, AWSError>;
    contentType: string;
  }> {
    try {
      const key = `${folder}/${new Date().toISOString()}_log`.replace(/ /g, '');

      const s3Object = await this.awsS3
        .putObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: file,
          ACL: 'public-read',
          ContentType: 'text/plain; charset=utf-8',
        })
        .promise();
      return { key, s3Object, contentType: 'content-type' };
    } catch (error) {
      throw new BadRequestException(`File upload failed : ${error}`);
    }
  }

  async deleteS3Object(
    key: string,
    callback?: (err: AWSError, data: S3.DeleteObjectOutput) => void,
  ): Promise<{ success: true }> {
    try {
      await this.awsS3
        .deleteObject(
          {
            Bucket: this.S3_BUCKET_NAME,
            Key: key,
          },
          callback,
        )
        .promise();
      return { success: true };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file : ${error}`);
    }
  }

  async listS3Object(folder: string) {
    const s3Object = await this.awsS3
      .listObjectsV2({
        Bucket: this.S3_BUCKET_NAME,
        Prefix: folder,
      })
      .promise();

    const promise = await Promise.all(
      s3Object.Contents.map(async (v) => {
        const url = `https://${this.configService.get(
          'AWS_S3_BUCKET_NAME',
        )}.s3.amazonaws.com/${v.Key}`;
        const data = await firstValueFrom(this.httpService.get(url));
        return data;
      }),
    );

    return promise.map((v) => v.data);
  }
}
