import { Args, Query, Resolver } from '@nestjs/graphql';
import { GetManyInput, GetPlaceType, Place } from 'src/entities';
import { PlaceService } from './place.service';

@Resolver()
export class PlaceResolver {
  constructor(private readonly placeService: PlaceService) {}

  @Query(() => GetPlaceType)
  getManyPlaces(
    @Args({ name: 'input', nullable: true })
    qs: GetManyInput<Place>,
  ) {
    return this.placeService.getMany(qs);
  }
}
