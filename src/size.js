/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
/* eslint-disable no-console */

const axios = require('axios');
const emoji = require('./utils/emoji');
const { toMap, getFileFromConfig } = require('./utils/utils');
const {
  isCommitedByMe,
  createPullRequest,
  createReviewRequest,
  updatePullRequest,
  listPullRequest,
} = require('./utils/github');
const { SIZE_STORE_ENDPOINT, STAR_REPO_MESSAGE, BOT } = require('./config');
const { fetchWithRetry } = require('./utils/api');

const url = `${SIZE_STORE_ENDPOINT}/size`;
const BASE_BRANCH = 'master';

async function fetchSizes(context, params) {
  const files = [];
  try {
    const sizefilepaths = await getFileFromConfig(context);

    await fetchWithRetry(() => axios.get(url, { params }).then((resp) => {
      const { data } = resp;
      const values = Object.values(data);
      if (sizefilepaths) {
        const sizeFileNameMap = toMap(
          sizefilepaths.filter(item => !item.commented),
          'filename',
        );
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

async function cleanUp(context, owner, name, number) {
  // close stale pull request
  console.log('cleaning stale pr');
  const allPullRequests = await listPullRequest(context.github, {
    owner: owner.name,
    repo: name,
    state: 'open',
    base: BASE_BRANCH,
  });
  const pullRequestsByBot = allPullRequests.filter((pr) => {
    const user = pr.user.login;
    if (pr.number === number) {
      return false;
    }
    if (BOT === user) {
      return true;
    }
    return false;
  });
  console.log('pr to close ', pullRequestsByBot.length);

  pullRequestsByBot.forEach(pr => updatePullRequest(context.github, {
    owner: owner.name,
    repo: name,
    pull_number: pr.number,
    state: 'closed',
  })
    .then(({ html_url }) => console.log('closed : ', html_url))
    .catch(console.error));
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
    if (branch === BASE_BRANCH && !isCommitedByMe(commits)) {
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
          base: BASE_BRANCH,
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
        await cleanUp(context, owner, name, number);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
module.exports = { get };
