import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common/exceptions';

@Injectable()
export class SeedService {
  //Para reflejar que estamos usando una dependencia de axios
  private readonly axios: AxiosInstance = axios;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async executeSeed() {
    const url = 'https://pokeapi.co/api/v2/pokemon/?limit=10';
    try {
      const { data } = await this.axios.get<PokeResponse>(url);
      for (const element of data.results) {
        const segments = element.url.split('/');
        const no: number = +segments[segments.length - 2];
        const { name } = element;
        await this.pokemonModel.create({ name, no });
      }
    } catch (err) {
      this.handleExceptions(err);
    }
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
