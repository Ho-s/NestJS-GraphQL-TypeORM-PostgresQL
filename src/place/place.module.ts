import { Module } from '@nestjs/common';
import { TypeOrmExModule } from '../common/modules/typeorm.module';
import { PlaceRepository } from './place.repositoy';
import { PlaceResolver } from './place.resolver';
import { PlaceService } from './place.service';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([PlaceRepository])],
  providers: [PlaceResolver, PlaceService],
})
export class PlaceModule {}
