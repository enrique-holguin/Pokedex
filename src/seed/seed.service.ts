import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common/exceptions';
import { AxiosAdapter } from 'src/common/httpAdapters/axios.adapter';

@Injectable()
export class SeedService {
  //Para reflejar que estamos usando una dependencia de axios
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany();
    const url = 'https://pokeapi.co/api/v2/pokemon/?limit=650';
    const data = await this.http.get<PokeResponse>(url);
    const pokemonToInsert: { name: string; no: number }[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      pokemonToInsert.push({ name, no });
    });
    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed Executed';
  }

  private handleExceptions(err: any) {
    if (err.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(err.keyValue)}`,
      );
    }
    console.log(err);
    const internalMsg = `Can't create Pokemon - Check server logs`;
    throw new InternalServerErrorException(internalMsg);
  }
}
