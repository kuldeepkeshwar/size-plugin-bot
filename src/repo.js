const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const {execAndLog} = require("./utils/command");

async function downloadFile(url, path) {
  const response = await axios(url, { responseType: "stream" });
  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
async function walkRepo(dir, path, options, getContents) {
  const _options = { ...options, path };
  await fs.ensureDir(`${dir}/${path}`);
  const { data: files } = await getContents(_options);
  const promises = files.map(file => {
    if (file.type === "dir") {
      return walkRepo(dir, file.path, options, getContents);
    }
    return downloadFile(file.download_url, `${dir}/${file.path}`);
  });
  return Promise.all(promises);
}
async function cloneRepo({ dir,options, getContents }) {
  await fs.emptyDir(dir);
  await walkRepo(dir, options.path, options, getContents);
}
async function runBuild(localRepoPath) {
  const child_process_options = { stdio: "inherit", cwd: localRepoPath };
  await execAndLog("npm install", child_process_options);
  await execAndLog("SIZE_PLUGIN_BOT=true npm run build", child_process_options);
  
}

async function cleanUp(localRepoPath) {
  await fs.emptyDir(localRepoPath);
}

module.exports = { cloneRepo, runBuild, cleanUp };
