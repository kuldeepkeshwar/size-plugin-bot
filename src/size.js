/* eslint-disable camelcase */
/* eslint-disable no-console */

const axios = require('axios');
const { SIZE_STORE_ENDPOINT } = require('./config');
const { fetchWithRetry } = require('./utils/api');


const url = `${SIZE_STORE_ENDPOINT}/size`;

function isCommitedByMe(commits) {
  if (commits.length === 1) {
    const [commit] = commits;
    const { author: { name } } = commit;
    if (name === 'size-plugin[bot]') {
      return true;
    }
  }
  return false;
}
async function getFile({context,owner,name,branch,filename}){
  try{
    const {data}=await context.github.repos.getContents({
        owner: owner.name,
        repo: name,
        branch,
        path: filename,
      })
    return data;
  }catch(err){
    console.error('getFile',err);
  }
} 

// eslint-disable-next-line consistent-return
async function get(context) {
  try {
    const {
      ref, repository: { name, full_name: repo, owner }, after: sha, commits,
    } = context.payload;
    const branch = ref.replace('refs/heads/', '');
    if (branch === 'master' && !isCommitedByMe(commits)) {
      const params = {
        repo,
        branch,
        sha,
      };
      const { filename, size } = await fetchWithRetry(() => axios.get(url, { params }));
      const content = Buffer.from(JSON.stringify(size,null, 2)).toString('base64');
      const file=await getFile({context,owner,name,branch,filename})
      if(file && file.content!==content){
        await context.github.repos.createOrUpdateFile({
          owner: owner.name,
          repo: name,
          path: filename,
          branch,
          message: `updated ${filename} 👍`,
          content,
          sha:file.sha
        });
      }else if(!file){
        await context.github.repos.createOrUpdateFile({
          owner: owner.name,
          repo: name,
          path: filename,
          branch,
          message: `created ${filename} 👍`,
          content
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}
module.exports = { get };
