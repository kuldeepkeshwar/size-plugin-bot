const { toLambda } = require('probot-serverless-now');

const applicationFunction = require('./src/index');

module.exports = toLambda(applicationFunction);
