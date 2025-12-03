import { Test, TestingModule } from '@nestjs/testing';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';
import { Readable } from 'stream';

import {
  MockService,
  MockServiceFactory,
} from 'src/common/factory/mockFactory';

import { UploadResolver } from './upload.resolver';
import { UploadService } from './upload.service';

describe('UploadResolver', () => {
  let resolver: UploadResolver;
  let mockedService: MockService<UploadService>;

  const mockFileUpload: FileUpload = {
    filename: 'test-file.png',
    mimetype: 'image/png',
    encoding: '7bit',
    createReadStream: () => Readable.from(Buffer.from('test')),
  };

  beforeAll(async () => {
    const { UploadResolver } = await import('./upload.resolver');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadResolver,
        {
          provide: UploadService,
          useFactory: MockServiceFactory.getMockService(UploadService),
        },
      ],
    }).compile();

    resolver = module.get(UploadResolver);
    mockedService = module.get<MockService<UploadService>>(UploadService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Calling "uploadFile" method', async () => {
    const key = 'someFolderName/2024-01-01T00:00:00.000Z_test-file.png';
    const expectedUrl = `https://test-bucket.s3.amazonaws.com/${key}`;

    mockedService.uploadFileToS3.mockResolvedValue({ key });
    mockedService.getLinkByKey.mockReturnValue(expectedUrl);

    const result = await resolver.uploadFile(mockFileUpload);

    expect(result).toEqual(expectedUrl);
    expect(mockedService.uploadFileToS3).toHaveBeenCalledWith({
      folderName: 'someFolderName',
      file: mockFileUpload,
    });
    expect(mockedService.getLinkByKey).toHaveBeenCalledWith(key);
  });

  it('Calling "uploadFiles" method', async () => {
    const files: FileUpload[] = [mockFileUpload, mockFileUpload];
    const key1 = 'someFolderName/2024-01-01T00:00:00.000Z_test-file-1.png';
    const key2 = 'someFolderName/2024-01-01T00:00:00.000Z_test-file-2.png';
    const expectedUrl1 = `https://test-bucket.s3.amazonaws.com/${key1}`;
    const expectedUrl2 = `https://test-bucket.s3.amazonaws.com/${key2}`;

    mockedService.uploadFileToS3
      .mockResolvedValueOnce({ key: key1 })
      .mockResolvedValueOnce({ key: key2 });
    mockedService.getLinkByKey
      .mockReturnValueOnce(expectedUrl1)
      .mockReturnValueOnce(expectedUrl2);

    const result = await resolver.uploadFiles(files);

    expect(result).toEqual([expectedUrl1, expectedUrl2]);
    expect(mockedService.uploadFileToS3).toHaveBeenCalledTimes(2);
  });

  it('Calling "deleteFiles" method', async () => {
    const keys = [
      'https://test-bucket.s3.amazonaws.com/folder/file1.png',
      'https://test-bucket.s3.amazonaws.com/folder/file2.png',
    ];

    mockedService.deleteS3Object.mockResolvedValue({ success: true });

    const result = await resolver.deleteFiles(keys);

    expect(result).toBe(true);
    expect(mockedService.deleteS3Object).toHaveBeenCalledTimes(2);
  });
});
