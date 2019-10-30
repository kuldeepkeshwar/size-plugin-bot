/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
/* eslint-disable no-console */

const axios = require('axios');
const GithubDb = require('simple-github-db');
const { getBotConfig } = require('./utils/utils');
const { SIZE_STORE_ENDPOINT } = require('./config');
const { decorateComment, decorateHeading } = require('./utils/template');
const { fetchWithRetry } = require('./utils/api');
const { isPullRequestOpenedByMe } = require('./utils/github');

const url = `${SIZE_STORE_ENDPOINT}/diff`;
const Database = GithubDb({ db: process.env.DATABASE_NAME, token: process.env.DATABASE_TOKEN });
const DOCUMENT = 'pull_requests';

function createIdentifier(repo) {
  return `${repo}`;
}

async function commentPullRequest(context, fullRepositoryName, pull_request_number, body) {
  const identifier = createIdentifier(fullRepositoryName);
  try {
    const pullRequestMap = await Database.fetchOne({ document: DOCUMENT, identifier });
    const comment_id = pullRequestMap[pull_request_number];
    if (comment_id) {
      const [owner, repo] = fullRepositoryName.split('/');
      await context.github.issues.updateComment({
        owner,
        repo,
        comment_id,
        body,
      });
    } else {
      const issueComment = context.issue({ body });
      const {
        data: { id },
      } = await context.github.issues.createComment(issueComment);
      await Database.update(
        { document: DOCUMENT, identifier },
        { ...pullRequestMap, [pull_request_number]: id },
      );
    }
  } catch (error) {
    const issueComment = context.issue({ body });
    const {
      data: { id },
    } = await context.github.issues.createComment(issueComment);
    await Database.add({ document: DOCUMENT, identifier }, { [pull_request_number]: id });
  }
}
function sizeCommentTemplate(item) {
  const {
    filename,
    diff: { files },
  } = item;
  return `  
${decorateHeading(filename, files)}

\`\`\`
${decorateComment(files)}
\`\`\`
  `;
}
function combinedCommentMessageTemplate(items, sha) {
  const sizes = items.reduce(
    (agg, item) => `${agg}
${sizeCommentTemplate(item)}
`,
    '',
  );

  return `
Size report for the changes in this PR: 
${sizes}

commit: ${sha} 
  `;
}

async function fetchSizes(repo, sha, pull_request_number, sizefiles) {
  let sizes = null;
  await fetchWithRetry(() => {
    const params = {
      repo,
      sha,
      pull_request_number,
    };
    return axios.get(url, { params }).then(({ data }) => {
      const values = Object.values(data);
      sizes = values;
      if (values.length < sizefiles.length) {
        throw Error('waiting for all file sizes');
      }
    });
  });
  return sizes;
}
// eslint-disable-next-line consistent-return
async function get(context) {
  try {
    const {
      pull_request: {
        number: pull_request_number,
        head: { sha },
        user,
      },
    } = context.payload;
    const {
      repository: { full_name },
    } = context.payload;
    const fullRepositoryName = full_name.toLowerCase();
    if (!isPullRequestOpenedByMe(user)) {
      const config = await getBotConfig(context);
      const sizefiles = config['size-files'];

      context.log(`fetching sizes for: ${fullRepositoryName}/pull/${pull_request_number}`);
      const sizes = await fetchSizes(fullRepositoryName, sha, pull_request_number, sizefiles);
      const message = combinedCommentMessageTemplate(sizes, sha);
      commentPullRequest(context, fullRepositoryName, pull_request_number, message).then(
        () => {
          context.log(
            `commented sizes for: ${fullRepositoryName}/pull/${pull_request_number}`,
          );
        },
        console.error,
      );
    }
  } catch (err) {
    console.error(err);
  }
}
module.exports = { get };
