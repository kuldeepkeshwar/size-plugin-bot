const repo = require("./repo");

const tmpDir = os.tmpdir();
const {decorateComment} = require("./utils/template");

const DIFF_FILE = "size-plugin-diff.json";
async function getSize(context) {
  let repoDir;
  try {
    const {
      ref,
      user: { login },
      repo: { name }
    } = context.payload.pull_request.head;
    const options = {
      repo: name,
      owner: login,
      path: "/",
      ref: ref
    };
    const dir = `${tmpDir}/${options.repo}`;
    await repo.cloneRepo({
      dir,
      options,
      getContents: context.github.repos.getContents
    });
    await repo.runBuild(repoDir);
    const buffer = await fs.readFile(`${repoDir}/${DIFF_FILE}`);
    const { files } = JSON.parse(buffer.toString());
    const stats = decorateComment(files);
    await repo.cleanUp(repoDir);
    return stats;
  } catch (err) {
    if (repoDir) {
      await repo.cleanUp(repoDir);
    }
    console.error(err);
  }
}
exports.getSize = getSize;
