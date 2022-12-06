import { Injectable } from '@nestjs/common';
import { OneRepoQuery, RepoQuery } from 'src/declare/types';
import { Place } from './entities/place.entity';
import { CreatePlaceInput, UpdatePlaceInput } from './inputs/place.input';

import { PlaceRepository } from './place.repositoy';

@Injectable()
export class PlaceService {
  constructor(private readonly placeRepository: PlaceRepository) {}
  getOne(qs?: OneRepoQuery<Place>) {
    return this.placeRepository.getOne(qs || {});
  }

  getMany(qs?: RepoQuery<Place>) {
    return this.placeRepository.getMany(qs || {});
  }

  async create(input: CreatePlaceInput): Promise<Place> {
    return this.placeRepository.save(input);
  }

  createMany(input: CreatePlaceInput[]): Promise<Place[]> {
    return this.placeRepository.save(input);
  }

  async update(id: number, input: UpdatePlaceInput): Promise<Place> {
    const place = await this.placeRepository.findOne({ where: { id } });
    return this.placeRepository.save({ ...place, ...input });
  }

  async delete(id: number) {
    const { affected } = await this.placeRepository.delete({ id });
    return { status: affected > 0 ? 'success' : 'fail' };
  }
}
