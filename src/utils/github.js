const BOT = 'size-plugin[bot]';

async function createBranch(github, {
  owner, repo, base = 'master', branch,
}) {
  const {
    data: {
      object: { sha },
    },
  } = await github.git.getRef({
    owner,
    repo,
    ref: `/heads/${base}`,
  });
  await github.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branch}`,
    sha,
  });
}
async function getFile(github, {
  owner, repo, branch, filename,
}) {
  try {
    const { data } = await github.repos.getContents({
      owner,
      repo,
      branch,
      path: filename,
    });
    return data;
  } catch (err) {
    console.error(
      'getFile:',
      owner,
      repo,
      branch,
      filename,
      err.message || err.status,
    );
  }
}
async function updateFile(github, {
  owner, repo, branch, file,
}) {
  const { filename, content } = file;
  const _content = Buffer.from(JSON.stringify(content, null, 2)).toString(
    'base64',
  );
  const oldFile = await getFile(github, {
    owner,
    repo,
    branch,
    filename,
  });
  if (oldFile && oldFile.content !== _content) {
    await github.repos.createOrUpdateFile({
      owner,
      repo,
      branch,
      path: filename,
      message: `update ${filename} 👍`,
      content: _content,
      sha: oldFile.sha,
    });
  } else if (!oldFile) {
    await github.repos.createOrUpdateFile({
      owner,
      repo,
      branch,
      path: filename,
      message: `create ${filename} 👍`,
      content: _content,
    });
  }
}
async function createPullRequest(
  github,
  {
    owner, repo, base, head, title,body, files,
  },
) {
  console.log('create branch:', head);

  await createBranch(github, {
    owner, repo, base, branch: head,
  });
  for (const file of files) {
    console.log('update file', head, file.filename);
    await updateFile(github, {
      owner, repo, branch: head, file,
    });
  }

  console.log('open pull request');
  await github.pulls.create({
    owner,
    repo,
    title,
    body,
    head,
    base,
  });
}
function isCommitedByMe(commits = []) {
  return !commits.some((commit) => {
    const {
      author: { name },
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
  getFile,
  updateFile,
  createPullRequest,
  createBranch,
};
