/* eslint-disable camelcase */
/* eslint-disable no-console */

const axios = require('axios');
const { SIZE_STORE_ENDPOINT } = require('./config');
const { fetchWithRetry } = require('./utils/api');


const url = `${SIZE_STORE_ENDPOINT}/size`;

function isCommitedByMe(commits){
  if(commits.length===1){
    const [commit]=commits;
    const {author:{name}}=commit;
    if(name==="size-plugin[bot]"){
     return true; 
    }
  }
  return false;
}
// eslint-disable-next-line consistent-return
async function get(context) {
  try {
    const { ref, repository: { name, full_name: repo, owner }, after: sha,commits } = context.payload;
    const branch = ref.replace('refs/heads/', '');
    if (branch === 'master' && !isCommitedByMe(commits)) {
      const params = {
        repo,
        branch,
        sha,
      };
      console.log({repo,
        branch,
        sha,})
      const {filename,size} = await fetchWithRetry(() => axios.get(url, { params }));
      const content = Buffer.from(JSON.stringify(size)).toString('base64');
      context.github.repos.createOrUpdateFile({
        owner: owner.name,
        repo: name,
        path: filename,
        message: 'updated sizes 👍',
        content,
      });
    }
  } catch (err) {
    console.error(err);
  }
}
module.exports = { get };
