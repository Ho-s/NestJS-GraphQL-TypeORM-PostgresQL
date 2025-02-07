import { Injectable } from '@nestjs/common';

import { UtilService } from '../services/util.service';

@Injectable()
export class SettingService {
  constructor(private readonly utilService: UtilService) {}
}
