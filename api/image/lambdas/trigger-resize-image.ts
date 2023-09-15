import { ImageService } from '../services/image.service';

export const handler = async (event: any) => {
  const { Records } = event;

  return ImageService.triggerResizeImage(Records);
};
