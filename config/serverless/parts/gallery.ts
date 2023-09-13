import { AWSPartitial } from '../types';

export const galleryConfig: AWSPartitial = {
  functions: {
    findImage: {
      handler: 'api/gallery/lamdas/find-image.handler',
      memorySize: 128,
      events: [
        {
          httpApi: {
            path: '/image',
            method: 'get',
          },
        },
      ],
    },
  },
};
