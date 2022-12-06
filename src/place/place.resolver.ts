import { Args, Query, Resolver } from '@nestjs/graphql';
import { GetManyInput } from 'src/declare/input/custom.input';
import { GetPlaceType, Place } from 'src/entities';
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
