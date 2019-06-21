/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
const repo=require("./repo");
async function getStats(context){
  let repoDir;
  try{
    const {ref,user:{login},repo:{name}}=context.payload.pull_request.head;
    const options={
      repo:name,
      owner:login,
      path:"/",
      ref: ref
    }
    repoDir=await repo.cloneRepo({options,getContents:context.github.repos.getContents});
    const stats=await repo.runBuild(repoDir);
    await repo.cleanUp(repoDir);
    return stats;
  }catch(err){
    if(repoDir){
      await repo.cleanUp(repoDir);
    }
    console.error(err)
  }
}
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')
  app.on(['pull_request.opened', 'pull_request.synchronize'], async context => {
    
    const stats= await getStats(context)
    if(stats){
      const issueComment = context.issue({ body: `
\`\`\`
${stats}
\`\`\`
      ` })
    return context.github.issues.createComment(issueComment)
    }
  })
}
