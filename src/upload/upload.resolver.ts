import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { ConfigService } from '@nestjs/config';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UploadService } from './upload.service';

@Resolver()
export class UploadResolver {
  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {}

  @Mutation(() => String)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
  ): Promise<string> {
    const { key } = await this.uploadService.uploadFileToS3({
      folderName: 'bewave',
      file,
    });

    return `https://${this.configService.get(
      'AWS_S3_BUCKET_NAME',
    )}.s3.amazonaws.com/${key}`;
  }

  @Mutation(() => [String])
  uploadFiles(
    @Args({ name: 'files', type: () => [GraphQLUpload] })
    files: FileUpload[],
  ): Promise<string[]> {
    return Promise.all(
      files.map(async (file) => {
        const { key } = await this.uploadService.uploadFileToS3({
          folderName: 'bewave',
          file,
        });

        return `https://${this.configService.get(
          'AWS_S3_BUCKET_NAME',
        )}.s3.amazonaws.com/${key}`;
      }),
    );
  }

  @Mutation(() => Boolean)
  async deleteFiles(
    @Args({ name: 'keys', type: () => [String] }) keys: string[],
  ) {
    const mapped = keys.map((key) => key.split('s3.amazonaws.com/')[1]);
    for await (const key of mapped) {
      this.uploadService.deleteS3Object(key);
    }
    return true;
  }
}
