/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
/* eslint-disable no-console */

const axios = require('axios');
const getConfig = require('probot-config');
const { toMap } = require('./utils/utils');
const { SIZE_STORE_ENDPOINT } = require('./config');
const { fetchWithRetry } = require('./utils/api');

const url = `${SIZE_STORE_ENDPOINT}/size`;

function isCommitedByMe(commits) {
  if (commits.length === 1) {
    const [commit] = commits;
    const {
      author: { name },
    } = commit;
    if (name === 'size-plugin[bot]') {
      return true;
    }
  }
  return false;
}
async function getFile({
  context, owner, name, branch, filename,
}) {
  try {
    const { data } = await context.github.repos.getContents({
      owner: owner.name,
      repo: name,
      branch,
      path: filename,
    });
    return data;
  } catch (err) {
    console.error('getFile', err);
  }
}

async function updateSizeFile(size, context, owner, name, branch, filename) {
  const content = Buffer.from(JSON.stringify(size, null, 2)).toString('base64');
  const file = await getFile({
    context,
    owner,
    name,
    branch,
    filename,
  });
  if (file && file.content !== content) {
    await context.github.repos.createOrUpdateFile({
      owner: owner.name,
      repo: name,
      path: filename,
      branch,
      message: `updated ${filename} 👍`,
      content,
      sha: file.sha,
    });
  } else if (!file) {
    await context.github.repos.createOrUpdateFile({
      owner: owner.name,
      repo: name,
      path: filename,
      branch,
      message: `created ${filename} 👍`,
      content,
    });
  }
}
// eslint-disable-next-line consistent-return
async function get(context) {
  try {
    const {
      ref,
      repository: { name, full_name: repo, owner },
      after: sha,
      commits,
    } = context.payload;
    const branch = ref.replace('refs/heads/', '');
    if (branch === 'master' && !isCommitedByMe(commits)) {
      let sizefilepaths;
      const botConfig = await getConfig(context, 'size-plugin.yml');
      sizefilepaths = botConfig && botConfig['size-files'].map(filename => ({ filename, commented: false }));

      const params = {
        repo,
        branch,
        sha,
      };
      await fetchWithRetry(() => axios.get(url, { params }).then(({ data }) => {
        const values = Object.values(data);
        if (sizefilepaths) {
          const sizeFileNameMap = toMap(sizefilepaths.filter(item => !item.commented), 'filename');
          const sizeMap = toMap(values, 'filename');
          let counter = 0;
          for (const filename of Object.keys(sizeFileNameMap)) {
            if (sizeMap[filename]) {
              updateSizeFile(sizeMap[filename].size, context, owner, name, branch, filename).then(console.log, console.error);
              sizeFileNameMap[filename].commented = true;
              counter += 1;
            }
          }
          sizefilepaths = Object.values(sizeFileNameMap);
          if (counter !== sizefilepaths.length) {
            console.log(sizefilepaths);
            throw Error('waiting for all file sizes');
          }
        } else {
          for (const { filename, size } of Object.values(data)) {
            updateSizeFile(size, context, owner, name, branch, filename).then(console.log, console.error);
          }
        }
      }));
    }
  } catch (err) {
    console.error(err);
  }
}
module.exports = { get };
