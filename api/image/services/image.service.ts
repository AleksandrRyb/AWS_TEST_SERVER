import { log } from '@helper/logger';
import axios from 'axios';

export class ImageService {
  static async findImage(searchTerm: string | undefined) {
    try {
      const result = await axios.get(
        `https://api.unsplash.com/search/photos?query=${searchTerm}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
      );

      return result.data;
    } catch (error) {
      log(error);
      return error;
    }
  }
}
