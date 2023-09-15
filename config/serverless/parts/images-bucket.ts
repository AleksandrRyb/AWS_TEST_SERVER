import { AWSPartitial } from '../types';

export const imagesBucketConfig: AWSPartitial = {
  params: {
    default: {
      BUCKET: 'images-prod-ff98s87f',
    },
  },
  provider: {
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:GetObject', 's3:PutObject'],
            Resource: ['arn:aws:s3:::${param:BUCKET}', 'arn:aws:s3:::${param:BUCKET}/*'],
          },
        ],
      },
    },
  },
  functions: {
    triggerImageResize: {
      handler: 'api/image/lambdas/trigger-resize-image.handler',
      description: 'Lambda for resizing images on uploads',
      events: [
        {
          s3: {
            bucket: '${param:BUCKET}',
            event: 's3:ObjectCreated:*',
            existing: true,
            rules: [
              {
                prefix: 'uploads/',
              },
            ],
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      myBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${param:BUCKET}',
        },
      },
    },
  },
};
