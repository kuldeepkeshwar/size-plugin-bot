/* eslint-disable no-console */


const { getSize } = require('./size');
// const keepAlive = require('./utils/keep-alive');

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

module.exports = (app) => {
  console.log('Yay, the app was loaded!');
  const router = app.route('/size-plugin');
  // router.use(keepAlive({
  //   path: '/size-plugin/_keepalive',
  //   handler(req, res, next, options) {
  //     if (req.path === options.path.replace('/size-plugin', '')) {
  //       res.send("I'm alive");
  //     } else {
  //       next();
  //     }
  //   },
  // }));
  router.get('/ping', (req, res) => {
    res.send('pong!!');
  });
  router.get('/', (req, res) => {
    res.send('Hello Dolores !!');
  });
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    setTimeout(handlePullRequest, 0, context);
  });
};
