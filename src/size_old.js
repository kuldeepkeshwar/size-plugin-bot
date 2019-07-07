/* eslint-disable no-console */

const fs = require('fs-extra');
const os = require('os');
const repo = require('./repo');

const rootTempDir = '/tmp';
const { decorateComment } = require('./utils/template');

const DIFF_FILE = 'size-plugin-diff.json';
// eslint-disable-next-line consistent-return
async function getSize(context) {
  let dir;
  try {
    const {
      ref,
      user: { login },
      repo: { name },
    } = context.payload.pull_request.head;
    const options = {
      repo: name,
      owner: login,
      path: '/',
      ref,
    };
    const exists = await fs.pathExists(rootTempDir);
    const tmpDir = exists ? rootTempDir : os.tmpdir();
    dir = `${tmpDir}/${login}/${options.repo}/${ref}/${Date.now()}`;
    await fs.emptyDir(dir);
    console.log('cloning repo to ', dir);
    await repo.clone({
      dir,
      options,
      getContents: context.github.repos.getContents,
    });

    console.log('running build');
    await repo.build(dir);

    console.log('build completed');

    const buffer = await fs.readFile(`${dir}/${DIFF_FILE}`);
    const { files } = JSON.parse(buffer.toString());
    const stats = decorateComment(files);
    await repo.clean(dir);
    return stats;
  } catch (err) {
    if (dir) {
      await repo.clean(dir);
    }
    console.error(err);
  }
}
exports.getSize = getSize;
