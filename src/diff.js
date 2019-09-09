/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
/* eslint-disable no-console */

const axios = require('axios');
const { toMap, getBotConfig } = require('./utils/utils');
const { SIZE_STORE_ENDPOINT } = require('./config');
const { decorateComment, decorateHeading } = require('./utils/template');
const { fetchWithRetry } = require('./utils/api');
const { isPullRequestOpenedByMe } = require('./utils/github');

const url = `${SIZE_STORE_ENDPOINT}/diff`;

async function commentPullRequest(context, message) {
  const issueComment = context.issue({ body: message });
  context.github.issues.createComment(issueComment);
  // return 'commented successfully';
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
function commentMessageTemplate(item, sha) {
  return `
Size report for the changes in this PR:
${sizeCommentTemplate(item)}

commit: ${sha}
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
// eslint-disable-next-line consistent-return
async function get(context) {
  try {
    const {
      pull_request: {
        number: pull_request_number,
        head: { ref: branch, sha },
        user,
      },
    } = context.payload;
    const {
      repository: { full_name: repo },
    } = context.payload;
    if (!isPullRequestOpenedByMe(user)) {
      const config = await getBotConfig(context);
      const sizefilepaths = config['size-files'].map(filename => ({
        filename,
        commented: false,
      }));

      await fetchWithRetry(() => {
        const params = {
          repo,
          branch,
          sha,
          pull_request_number,
        };
        return axios.get(url, { params }).then(({ data }) => {
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
                const message = commentMessageTemplate(sizeMap[filename], sha);
                commentPullRequest(context, message).then(
                  console.log,
                  console.error,
                );
                sizeFileNameMap[filename].commented = true;
                counter += 1;
              }
            }
            if (counter !== Object.values(sizeFileNameMap).length) {
              console.log(Object.values(sizeFileNameMap));
              throw Error('waiting for all file sizes');
            }
          } else {
            const message = combinedCommentMessageTemplate(values, sha);
            commentPullRequest(context, message).then(console.log, console.error);
          }
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
}
module.exports = { get };
