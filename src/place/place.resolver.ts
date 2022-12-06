import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { GetManyInput, GetOneInput } from 'src/declare/inputs/custom.input';

import { GraphqlPassportAuthGuard } from 'src/modules/guards/graphql-passport-auth.guard';
import { GetPlaceType, Place } from './entities/place.entity';
import { CreatePlaceInput, UpdatePlaceInput } from './inputs/place.input';
import { PlaceService } from './place.service';

@Resolver()
export class PlaceResolver {
  constructor(private readonly placeService: PlaceService) {}

  @Query(() => GetPlaceType)
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  getManyPlaces(
    @Args({ name: 'input', nullable: true })
    qs: GetManyInput<Place>,
  ) {
    return this.placeService.getMany(qs);
  }

  @Query(() => Place)
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  getOnePlace(
    @Args({ name: 'input', nullable: true })
    qs: GetOneInput<Place>,
  ) {
    return this.placeService.getOne(qs);
  }

  @Mutation(() => Place)
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  createPlace(@Args('input') input: CreatePlaceInput) {
    return this.placeService.create(input);
  }

  @Mutation(() => [Place])
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  createManyPlaces(
    @Args({ name: 'input', type: () => [CreatePlaceInput] })
    input: CreatePlaceInput[],
  ) {
    return this.placeService.createMany(input);
  }

  @Mutation(() => Place)
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  updatePlace(@Args('id') id: number, @Args('input') input: UpdatePlaceInput) {
    return this.placeService.update(id, input);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  deletePlace(@Args('id') id: number) {
    return this.placeService.delete(id);
  }
}
