
const express = require("express")
const path = require("path");

const {getSize}=require("./size");

async function handlePullRequest(context) {
  
  const size = await getSize(context);
  if (size) {
    const issueComment = context.issue({
    body: `
\`\`\`
${size}
\`\`\`
    ` });
    return context.github.issues.createComment(issueComment);
  }
};

module.exports = app => {
  app.log('Yay, the app was loaded!')
  const router = app.route('/size-plugin')
  router.use( express.static(path.join(process.cwd(), 'static')))
  router.get('/ping', (req, res) => {
    res.send('pong')
  })
  app.on(['pull_request.opened', 'pull_request.synchronize'], handlePullRequest)
}


