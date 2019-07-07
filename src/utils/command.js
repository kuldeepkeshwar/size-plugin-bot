
const execa = require('execa');

async function execAndLog(cmd, options) {
  const { message } = await execa.shell(cmd, options);
  if (message) {
    console.error('FAILED!!', message);
  }
}

module.exports = { execAndLog };
