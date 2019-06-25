
const { serverless } = require('./probot-serverless-now')
const appFn = require('./src')
module.exports = serverless(appFn)