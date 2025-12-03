import { Args, Mutation, Resolver } from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { UploadService } from './upload.service';

@Resolver()
export class UploadResolver {
  private readonly FOLDER_NAME = 'someFolderName';
  constructor(private readonly uploadService: UploadService) {}

  @Mutation(() => String)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
  ): Promise<string> {
    const { key } = await this.uploadService.uploadFileToS3({
      folderName: this.FOLDER_NAME,
      file,
    });

    return this.uploadService.getLinkByKey(key);
  }

  @Mutation(() => [String])
  uploadFiles(
    @Args({ name: 'files', type: () => [GraphQLUpload] })
    files: FileUpload[],
  ): Promise<string[]> {
    return Promise.all(
      files.map(async (file) => {
        const { key } = await this.uploadService.uploadFileToS3({
          folderName: this.FOLDER_NAME,
          file,
        });

        return this.uploadService.getLinkByKey(key);
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
