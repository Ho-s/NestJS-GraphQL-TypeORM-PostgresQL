import { Injectable } from '@nestjs/common';
import { RepoQuery } from 'src/declare/declare.module';
import { Place } from 'src/entities';
import { PlaceRepository } from './place.repositoy';

@Injectable()
export class PlaceService {
  constructor(private readonly placeRepository: PlaceRepository) {}

  getMany(qs?: RepoQuery<Place>) {
    return this.placeRepository.getMany(qs || {});
  }
}
