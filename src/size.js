/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
/* eslint-disable no-console */

const axios = require('axios');
const emoji = require('./utils/emoji');
const { toMap, getFileFromConfig } = require('./utils/utils');
const { isCommitedByMe, createPullRequest, createReviewRequest } = require('./utils/github');
const { SIZE_STORE_ENDPOINT, STAR_REPO_MESSAGE } = require('./config');
const { fetchWithRetry } = require('./utils/api');

const url = `${SIZE_STORE_ENDPOINT}/size`;

async function fetchSizes(context, params) {
  const files = [];
  try {
    const sizefilepaths = await getFileFromConfig(context);

    await fetchWithRetry(() => axios.get(url, { params }).then((resp) => {
      const { data } = resp;
      const values = Object.values(data);
      if (sizefilepaths) {
        const sizeFileNameMap = toMap(sizefilepaths.filter(item => !item.commented), 'filename');
        const sizeMap = toMap(values, 'filename');
        let counter = 0;
        for (const filename of Object.keys(sizeFileNameMap)) {
          if (sizeMap[filename]) {
            files.push({
              filename,
              content: sizeMap[filename].size,
            });
            sizeFileNameMap[filename].commented = true;
            counter += 1;
          }
        }
        if (counter !== Object.values(sizeFileNameMap).length) {
          console.log(Object.values(sizeFileNameMap));
          throw Error('waiting for all file sizes');
        }
      } else {
        files.push(
          ...Object.values(data).map(({ filename, size }) => ({
            filename,
            content: size,
          })),
        );
      }
    }));
  } catch (error) {
    console.error(error);
  }
  return files;
}
// eslint-disable-next-line consistent-return
async function get(context) {
  try {
    const {
      ref,
      repository: { name, full_name: repo, owner },
      after: sha,
      head_commit,
      commits,
    } = context.payload;
    const branch = ref.replace('refs/heads/', '');
    if (branch === 'master' && !isCommitedByMe(commits)) {
      const params = { repo, branch, sha };
      const files = await fetchSizes(context, params);
      if (files.length) {
        const title = `${emoji.random().join(' ')} update sizes`;
        const body = `👇 
${head_commit.id} : ${head_commit.message || ''}
${STAR_REPO_MESSAGE}
`;
        const { number } = await createPullRequest(context.github, {
          owner: owner.name,
          repo: name,
          base: 'master',
          head: `size-plugin-${Date.now()}`,
          title,
          body,
          files,
        });
        await createReviewRequest(context.github, {
          owner: owner.name,
          repo: name,
          pull_number: number,
          reviewers: commits.map(({ author: { username } }) => username),
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}
module.exports = { get };
