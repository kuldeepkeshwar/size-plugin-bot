
const fs = require('fs-extra');
const axios = require('axios');
const { execAndLog } = require('./command');

async function downloadFile(url, path) {
  const response = await axios(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
async function walk(dir, path, options, getContents) {
  const opt = { ...options, path };
  await fs.ensureDir(`${dir}/${path}`);
  const { data: files } = await getContents(opt);
  const promises = files.map((file) => {
    if (file.type === 'dir') {
      return walk(dir, file.path, options, getContents);
    }
    return downloadFile(file.download_url, `${dir}/${file.path}`);
  });
  return Promise.all(promises);
}
async function clone({ dir, options, getContents }) {
  await walk(dir, options.path, options, getContents);
}
async function build(localRepoPath) {
  const childProcessOptions = { stdio: 'inherit', cwd: localRepoPath };
  await execAndLog('npm install', childProcessOptions);
  await execAndLog('SIZE_PLUGIN_BOT=true npm run build', childProcessOptions);
}

async function clean(localRepoPath) {
  await fs.emptyDir(localRepoPath);
}

module.exports = { clone, build, clean };
