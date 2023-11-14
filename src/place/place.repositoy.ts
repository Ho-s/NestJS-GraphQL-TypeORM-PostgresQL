import { CustomRepository } from '../common/decorators/typeorm.decorator';
import { Place } from './entities/place.entity';
import { ExtendedRepository } from 'src/common/graphql/customExtended';

@CustomRepository(Place)
export class PlaceRepository extends ExtendedRepository<Place> {}
