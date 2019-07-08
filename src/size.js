/* eslint-disable camelcase */
/* eslint-disable no-console */

const axios = require('axios');

const { decorateComment } = require('./utils/template');
const { MAX_RETRY, RETRY_INTERVAL } = require('./config');

const url = 'https://size-plugin-store.now.sh/diff';

function hanldeError(error) {
  if (error.response) {
    console.error({ data: error.response.data, status: error.response.status });
  } else if (error.request) {
    console.error(error.request);
  } else {
    console.error('Error', error.message);
  }
}
function fetchDiff({
  repo, branch, sha, pull_request_number,
}) {
  return new Promise((resolve, reject) => {
    const params = {
      repo,
      branch,
      sha,
      pull_request_number,
    };
    let retry = 0;
    const id = setInterval(() => {
      (async function poll() {
        try {
          retry += 1;
          const response = await axios.get(url, { params });
          clearInterval(id);
          resolve(response.data);
        } catch (error) {
          hanldeError(error);
          if (retry === MAX_RETRY) {
            clearInterval(id);
            reject(new Error(`waiting for diff(retry ${retry}): ${repo} ${branch} ${pull_request_number} ${sha}`));
          }
        }
      }());
    }, RETRY_INTERVAL);
  });
}
// eslint-disable-next-line consistent-return
async function getSize(context) {
  try {
    const {
      pull_request: {
        number: pull_request_number,
        base: { ref: branch },
      },
    } = context.payload;
    const {
      repository: { full_name: repo },
      after: sha,
    } = context.payload;
    const { files } = await fetchDiff({
      repo,
      branch,
      sha,
      pull_request_number,
    });
    const stats = decorateComment(files);
    return stats;
  } catch (err) {
    console.error(err);
  }
}
exports.getSize = getSize;
