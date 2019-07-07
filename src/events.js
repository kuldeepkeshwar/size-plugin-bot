/* eslint-disable no-console */

const { getSize } = require('./size');

// eslint-disable-next-line consistent-return
async function handlePullRequest(context) {
  const size = await getSize(context);
  if (size) {
    const issueComment = context.issue({
      body: `
\`\`\`
${size}
\`\`\`
    `,
    });
    return context.github.issues.createComment(issueComment);
  }
}
function register(app) {
  app.on(['push'], async () => {
    // TODO: implement auto update size-plugin.json
  });
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    setTimeout(handlePullRequest, 0, context);
  });
}
module.exports = { register };
