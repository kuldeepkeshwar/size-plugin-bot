

const {getSize}=require("./size");
const keepAlive= require("./utils/keep-alive");

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
  console.log('Yay, the app was loaded!')
  
  const router = app.route('/size-plugin')
  router.use(keepAlive({
    path:"/_keepalive"
  }))
  router.get('/ping', (req, res) => {
    res.send('pong!!')
  })
  router.get('/', (req, res) => {
    res.send('Hello Dolores !!')
  })
  app.on(['pull_request.opened', 'pull_request.synchronize'], handlePullRequest)
}


