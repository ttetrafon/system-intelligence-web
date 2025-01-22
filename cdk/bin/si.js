const cdk = require('aws-cdk-lib');
const siStack = require('../lib/si-stack');

async function main() {
  const app = new cdk.App();

  new siStack.SiStack(app, 'SiStack', {});
}

main().catch(console.error);