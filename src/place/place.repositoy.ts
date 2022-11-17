import { Place } from '../entities';
import { CustomRepository } from '../modules/decorators/typeorm.decorator';
import { Repository } from 'typeorm/repository/Repository';

@CustomRepository(Place)
export class PlaceRepository extends Repository<Place> {}
