/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { BOT } = require("./../config");

const emoji = require("./emoji");

async function createBranch(github, { owner, repo, base = "master", branch }) {
  const {
    data: {
      object: { sha }
    }
  } = await github.git.getRef({
    owner,
    repo,
    ref: `/heads/${base}`
  });
  await github.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branch}`,
    sha
  });
}
async function getFile(github, { owner, repo, branch, filename }) {
  try {
    const { data } = await github.repos.getContents({
      owner,
      repo,
      branch,
      path: filename
    });
    return data;
  } catch (err) {
    console.error(
      "getFile:",
      owner,
      repo,
      branch,
      filename,
      err.message || err.status
    );
  }
  return null;
}
async function updateFile(github, { owner, repo, branch, file }) {
  const { filename, content } = file;
  const data = Buffer.from(JSON.stringify(content, null, 2)).toString("base64");
  const oldFile = await getFile(github, {
    owner,
    repo,
    branch,
    filename
  });
  if (oldFile && oldFile.content !== data) {
    await github.repos.createOrUpdateFile({
      owner,
      repo,
      branch,
      path: filename,
      message: `${emoji.random().join(" ")} update ${filename} 👍`,
      content: data,
      sha: oldFile.sha
    });
  } else if (!oldFile) {
    await github.repos.createOrUpdateFile({
      owner,
      repo,
      branch,
      path: filename,
      message: `${emoji.random().join(" ")} create ${filename} 👍`,
      content: data
    });
  }
}
async function createPullRequest(
  github,
  { owner, repo, base, head, title, body, files }
) {
  console.log("create branch:", head);

  await createBranch(github, {
    owner,
    repo,
    base,
    branch: head
  });
  for (const file of files) {
    console.log("update file", head, file.filename);
    await updateFile(github, {
      owner,
      repo,
      branch: head,
      file
    });
  }
  const { data } = await github.pulls.create({
    owner,
    repo,
    title,
    body,
    head,
    base
  });
  console.log("opened pull request", data.number);
  return data;
}
async function createReviewRequest(
  github,
  { owner, repo, pull_number, reviewers }
) {
  console.log("createReviewRequest", owner, repo, pull_number, reviewers);
  github.pulls.createReviewRequest({
    owner,
    repo,
    pull_number,
    reviewers
  });
}
async function listPullRequest(
  github,
  {
    owner,
    repo,
    state // head, base,
  }
) {
  const { data } = await github.pulls.list({
    owner,
    repo,
    state
    // head,
    // base,
  });
  return data;
}
async function updatePullRequest(github, { owner, repo, pull_number, state }) {
  const { data } = await github.pulls.update({
    owner,
    repo,
    pull_number,
    state
  });
  return data;
}
function isCommitedByMe(commits = []) {
  return !commits.some(commit => {
    const {
      author: { name }
    } = commit;
    if (name !== BOT) {
      return true;
    }
    return false;
  });
}
function isPullRequestOpenedByMe(user) {
  return user.login === BOT;
}
module.exports = {
  isCommitedByMe,
  isPullRequestOpenedByMe,
  createReviewRequest,
  getFile,
  updateFile,
  createPullRequest,
  listPullRequest,
  updatePullRequest,
  createBranch
};
