const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const execa = require("execa");
const prettyBytes = require("pretty-bytes");
const tmpDir = os.tmpdir();

const DIFF_FILE = "size-plugin-diff.json";
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
async function cloneRepo({ options, getContents }) {
  const dir = `${tmpDir}/${options.repo}`;
  await fs.emptyDir(dir);
  await walkRepo(dir, options.path, options, getContents);
  return dir;
}
async function runBuild(localRepoPath) {
  const child_process_options = { stdio: "inherit", cwd: localRepoPath };
  await execAndLog("npm install", child_process_options);
  await execAndLog("SIZE_PLUGIN_BOT=true npm run build", child_process_options);
  const buffer = await fs.readFile(`${localRepoPath}/${DIFF_FILE}`);
  const {files}=JSON.parse(buffer.toString());
  return decorateComment(files);
}
async function execAndLog(cmd, options) {
  const { message } = await execa.shell(cmd, options);
  if (message) {
    console.error("FAILED!!", message);
  }
}
async function cleanUp(localRepoPath) {
  await fs.emptyDir(localRepoPath);
}

function decorateComment(files) {
  const width = Math.max(...files.map(file => file.filename.length));
  // filename,
  // previous,
  // size,
  // diff
  let output = '';
  for (const file of files) {
    const { filename:name, size, diff: delta } = file;
    const msg = new Array(width - name.length + 2).join(" ") + name + " ⏤  ";
    const color =
      size > 100 * 1024
        ? "red"
        : size > 40 * 1024
        ? "yellow"
        : size > 20 * 1024
        ? "cyan"
        : "green";
    let sizeText = colorText(color,prettyBytes(size));
    let deltaText = "";
    if (delta && Math.abs(delta) > 1) {
      deltaText = (delta > 0 ? "+" : "") + prettyBytes(delta);
      if (delta > 1024) {
        sizeText = bold(sizeText);
        deltaText = colorText('red',deltaText);
      } else if (delta < -10) {
        deltaText = colorText('green',deltaText);
      }
      sizeText += ` (${deltaText})`;
    }
    let text = msg + sizeText + "\n";
    output += text;
  }
  return output;
}
function bold(text) {
  return text;
  //return `<b>${text}</b>`;
}
function colorText(color, text) {
  return text;
  //return `<span style="color:${color}">${text}</span>`;
}
module.exports = { cloneRepo, runBuild, cleanUp };
