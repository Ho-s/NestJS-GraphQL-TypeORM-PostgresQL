import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import type { FileUpload } from 'graphql-upload/processRequest.mjs';
import { of } from 'rxjs';
import { Readable } from 'stream';

import { CustomBadRequestException } from 'src/common/exceptions';

import { UploadService } from './upload.service';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/lib-storage');

describe('UploadService', () => {
  let service: UploadService;
  let mockS3Send: jest.Mock;
  let mockHttpService: { get: jest.Mock };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        AWS_S3_REGION: 'ap-northeast-2',
        AWS_S3_ACCESS_KEY: 'test-access-key',
        AWS_S3_SECRET_KEY: 'test-secret-key',
        AWS_S3_BUCKET_NAME: 'test-bucket',
      };
      return config[key];
    }),
  };

  const mockFileUpload: FileUpload = {
    filename: 'test-file.png',
    mimetype: 'image/png',
    encoding: '7bit',
    createReadStream: () => Readable.from(Buffer.from('test')),
  };

  beforeAll(async () => {
    mockS3Send = jest.fn();
    (S3 as jest.Mock).mockImplementation(() => ({
      send: mockS3Send,
    }));

    mockHttpService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLinkByKey', () => {
    it('should return correct S3 URL', () => {
      const key = 'folder/test-file.png';
      const result = service.getLinkByKey(key);

      expect(result).toBe(
        'https://test-bucket.s3.amazonaws.com/folder/test-file.png',
      );
    });
  });

  describe('uploadFileToS3', () => {
    it('should upload file successfully', async () => {
      const mockUploadDone = jest.fn().mockResolvedValue({});
      (Upload as unknown as jest.Mock).mockImplementation(() => ({
        done: mockUploadDone,
      }));

      const result = await service.uploadFileToS3({
        folderName: 'testFolder',
        file: mockFileUpload,
      });

      expect(result).toHaveProperty('key');
      expect(result.key).toContain('testFolder/');
      expect(result.key).toContain('test-file.png');
      expect(mockUploadDone).toHaveBeenCalled();
    });

    it('should throw CustomBadRequestException on upload failure', async () => {
      (Upload as unknown as jest.Mock).mockImplementation(() => ({
        done: jest.fn().mockRejectedValue(new Error('Upload failed')),
      }));

      await expect(
        service.uploadFileToS3({
          folderName: 'testFolder',
          file: mockFileUpload,
        }),
      ).rejects.toThrow(CustomBadRequestException);
    });
  });

  describe('deleteS3Object', () => {
    it('should delete file successfully', async () => {
      mockS3Send
        .mockResolvedValueOnce({ Contents: [{ Key: 'folder/file.png' }] })
        .mockResolvedValueOnce({});

      const result = await service.deleteS3Object('folder/file.png');

      expect(result).toEqual({ success: true });
      expect(mockS3Send).toHaveBeenCalledTimes(2);
    });

    it('should throw CustomBadRequestException when file does not exist', async () => {
      mockS3Send.mockResolvedValueOnce({ Contents: [] });

      await expect(
        service.deleteS3Object('nonexistent/file.png'),
      ).rejects.toThrow(CustomBadRequestException);
    });

    it('should throw CustomBadRequestException on delete failure', async () => {
      mockS3Send
        .mockResolvedValueOnce({ Contents: [{ Key: 'folder/file.png' }] })
        .mockRejectedValueOnce(new Error('Delete failed'));

      await expect(service.deleteS3Object('folder/file.png')).rejects.toThrow(
        CustomBadRequestException,
      );
    });
  });

  describe('listS3Object', () => {
    it('should list and fetch S3 objects', async () => {
      const mockContents = [
        { Key: 'folder/file1.png' },
        { Key: 'folder/file2.png' },
      ];

      mockS3Send.mockResolvedValueOnce({ Contents: mockContents });
      mockHttpService.get
        .mockReturnValueOnce(of({ data: 'file1-content' }))
        .mockReturnValueOnce(of({ data: 'file2-content' }));

      const result = await service.listS3Object('folder');

      expect(result).toEqual(['file1-content', 'file2-content']);
      expect(mockHttpService.get).toHaveBeenCalledTimes(2);
    });
  });
});
