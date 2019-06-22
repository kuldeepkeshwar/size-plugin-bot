const repo = require("./repo");
async function getSize(context) {
  let repoDir;
  try {
    const { ref, user: { login }, repo: { name } } = context.payload.pull_request.head;
    const options = {
      repo: name,
      owner: login,
      path: "/",
      ref: ref
    };
    repoDir = await repo.cloneRepo({ options, getContents: context.github.repos.getContents });
    const stats = await repo.runBuild(repoDir);
    await repo.cleanUp(repoDir);
    return stats;
  }
  catch (err) {
    if (repoDir) {
      await repo.cleanUp(repoDir);
    }
    console.error(err);
  }
}
exports.getSize = getSize;
