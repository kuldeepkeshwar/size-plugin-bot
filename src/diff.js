/* eslint-disable camelcase */
/* eslint-disable no-console */

const axios = require('axios');
const { SIZE_STORE_ENDPOINT } = require('./config');
const { decorateComment } = require('./utils/template');
const { fetchWithRetry } = require('./utils/api');


const url = `${SIZE_STORE_ENDPOINT}/diff`;

// eslint-disable-next-line consistent-return
async function get(context) {
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
    const { diff:{files} } = await fetchWithRetry(() => {
      const params = {
        repo,
        branch,
        sha,
        pull_request_number,
      };
      return axios.get(url, { params });
    });
    const stats = decorateComment(files);
    return stats;
  } catch (err) {
    console.error(err);
  }
}
module.exports = { get };
