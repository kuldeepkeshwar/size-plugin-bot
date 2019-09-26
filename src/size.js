/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
/* eslint-disable no-console */

const axios = require('axios');
const emoji = require('./utils/emoji');
const { toMap, getBotConfig } = require('./utils/utils');
const {
  isCommitedByMe,
  updateFile,
  createPullRequest,
  createReviewRequest,
  updatePullRequest,
  listPullRequest,
} = require('./utils/github');
const { SIZE_STORE_ENDPOINT, STAR_REPO_MESSAGE, BOT } = require('./config');
const { fetchWithRetry } = require('./utils/api');

const url = `${SIZE_STORE_ENDPOINT}/size`;

async function fetchSizes(params, sizefilepaths) {
  const files = [];
  try {
    await fetchWithRetry(() => axios.get(url, { params }).then((resp) => {
      const { data } = resp;
      const values = Object.values(data);
      if (sizefilepaths.length > 1) {
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

async function cleanUp(context, owner, repo, branch, number) {
  // close stale pull request
  console.log('cleaning stale pr');
  const allPullRequests = await listPullRequest(context.github, {
    owner: owner.name,
    repo,
    state: 'open',
  });
  const pullRequestsByBot = allPullRequests.filter((pr) => {
    const user = pr.user.login;
    const base = pr.base.ref;
    if (base !== branch) {
      return false;
    }
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
    repo,
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
      repository: { name, full_name, owner },
      after: sha,
      head_commit,
      commits,
    } = context.payload;
    
    const repo = full_name.toLowerCase();
    const branch = ref.replace('refs/heads/', '');
    const config = await getBotConfig(context);
    const baseBranches = config['base-branches'];
    const sizefilepaths = config['size-files'].map(filename => ({
      filename,
      commented: false,
    }));
    if (baseBranches.includes(branch) && !isCommitedByMe(commits)) {
      const params = { repo, branch, sha };
      const files = await fetchSizes(params, sizefilepaths);
      if (files.length) {
        try {
          for (const file of files) {
            await updateFile(context.github, {
              owner: owner.name,
              repo: name,
              base: branch,
              file,
            });
          }
        } catch (err) {
          const title = `${emoji.random().join(' ')} update sizes`;
          const body = `👇 
${head_commit.id} : ${head_commit.message || ''}
${STAR_REPO_MESSAGE}
`;
          const { number } = await createPullRequest(context.github, {
            owner: owner.name,
            repo: name,
            base: branch,
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
          await cleanUp(context, owner, name, branch, number);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}
module.exports = { get };
