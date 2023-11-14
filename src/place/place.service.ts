import { Injectable } from '@nestjs/common';
import { OneRepoQuery, RepoQuery } from 'src/common/graphql/types';
import { Place } from './entities/place.entity';
import { CreatePlaceInput, UpdatePlaceInput } from './inputs/place.input';
import { PlaceRepository } from './place.repositoy';

@Injectable()
export class PlaceService {
  constructor(private readonly placeRepository: PlaceRepository) {}

  getMany(qs: RepoQuery<Place> = {}, gqlQuery?: string) {
    return this.placeRepository.getMany(qs, gqlQuery);
  }

  getOne(qs: OneRepoQuery<Place>, gqlQuery?: string) {
    return this.placeRepository.getOne(qs, gqlQuery);
  }

  create(input: CreatePlaceInput): Promise<Place> {
    const place = this.placeRepository.create(input);

    return this.placeRepository.save(place);
  }

  update(id: number, input: UpdatePlaceInput) {
    const user = this.placeRepository.create(input);

    return this.placeRepository.update(id, user);
  }
  delete(id: number) {
    return this.placeRepository.delete({ id });
  }
}
