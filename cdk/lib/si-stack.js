const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');

class SiStack extends cdk.Stack {
  /**
   * @param {App} scope
   * @param {string} id
   * @param {Object} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    new s3.Bucket(this, 'si-static-bucket', {
      bucketName: 'si-static-bucket',
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED
    });
  }
}

module.exports = { SiStack }