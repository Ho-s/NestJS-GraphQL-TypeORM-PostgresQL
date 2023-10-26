import { CustomRepository } from '../modules/decorators/typeorm.decorator';
import { Place } from './entities/place.entity';
import { ExtendedRepository } from 'src/declare/declare.module';

@CustomRepository(Place)
export class PlaceRepository extends ExtendedRepository<Place> {}
