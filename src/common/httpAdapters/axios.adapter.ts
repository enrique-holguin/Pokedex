//Es un envoltorio que sirve en caso de que Axios cambie sus métodos o propiedades
//De esa forma solo modificaríamos esta clase

import axios, { AxiosInstance } from 'axios';
import { HttpAdapter } from '../interfaces/http-adapter.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AxiosAdapter implements HttpAdapter {
  private axios: AxiosInstance = axios;
  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await this.axios.get<T>(url);
      return data;
    } catch (err) {
      throw new Error('Error in AxiosAdapter(get) - Check Logs');
    }
  }
}
