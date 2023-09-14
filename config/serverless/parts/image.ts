import { AWSPartitial } from '../types';

export const imageConfig: AWSPartitial = {
  functions: {
    findimage: {
      handler: 'api/image/lambdas/find-image.handler',
      memorySize: 128,
      events: [
        {
          httpApi: {
            path: '/image',
            method: 'get',
            authorizer: {
              name: 'customAuthorizer',
            },
          },
        },
      ],
    },
    addimages: {
      handler: 'api/image/lambdas/add-images.handler',
      memorySize: 256,
      events: [
        {
          httpApi: {
            path: '/image/add',
            method: 'post',
            authorizer: {
              name: 'customAuthorizer',
            },
          },
        },
      ],
    },
  },
};
