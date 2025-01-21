#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { SiStack } = require('../lib/si-stack');

const app = new cdk.App();
new SiStack(app, 'SiStack');
