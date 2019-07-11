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
        head: { ref: branch,sha },
      },
    } = context.payload;
    const {
      repository: { full_name: repo }
    } = context.payload;
    const data = await fetchWithRetry(() => {
      const params = {
        repo,
        branch,
        sha,
        pull_request_number,
      };
      return axios.get(url, { params });
    });
    const values=Object.values(data);
    return values.length===1?(
    `
\`\`\`
${decorateComment(values[0].diff.files)}
\`\`\`
`
    ):values.reduce((agg,item)=>{
      const { filename,diff:{files} }=item;
return agg+`

${filename}:
\`\`\`
${decorateComment(files)}
\`\`\`

`
    } ,'');
  } catch (err) {
    console.error(err);
  }
}
module.exports = { get };
