/* eslint-disable no-console */

const diff = require('./diff');
const size = require('./size');

// eslint-disable-next-line consistent-return
async function handlePullRequest(context) {
  const message = await diff.get(context);
  if (message) {
    const issueComment = context.issue({
      body: message,
    });
    return context.github.issues.createComment(issueComment);
  }
}
function register(app) {
  app.on(['push'], async (context) => {
    setTimeout(size.get, 0, context);
  });
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    setTimeout(handlePullRequest, 0, context);
  });
}
module.exports = { register };
