import { AWSPartitial } from '../types';

export const galleryBucketConfig: AWSPartitial = {
  params: {
    default: {
      BUCKET: 'gallery-prod-ff98s87fhs',
    },
  },
  provider: {
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:*'],
            Resource: ['arn:aws:s3:::${param:BUCKET}'],
          },
        ],
      },
    },
  },
  functions: {
    // prefix "trigger" for S3, SQS, SNS, EventBridge, etc, Lambda triggers
    // triggerS3Example: {
    //   handler: 'api/feature/handler.feature',
    //   description: 'Example of Lambda function with S3 trigger',
    //   timeout: 28,
    //   events: [
    //     {
    //       s3: {
    //         bucket: '${param:BUCKET}',
    //         event: 's3:ObjectCreated:*',
    //       },
    //     },
    //   ],
    // },
    findImage: {
      handler: 'api/gallery/lamdas/find-image.handler',
      memorySize: 128,
      events: [
        {
          httpApi: {
            path: '/signup',
            method: 'get',
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
