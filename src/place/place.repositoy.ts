import { CustomRepository } from '../modules/decorators/typeorm.decorator';
import { Repository } from 'typeorm/repository/Repository';
import { Place } from './entities/place.entity';

@CustomRepository(Place)
export class PlaceRepository extends Repository<Place> {}
