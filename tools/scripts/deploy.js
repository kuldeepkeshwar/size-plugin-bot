#!/usr/bin/env node
require('dotenv').config();

const execa = require('execa');
const { alias } = require('../../now.json');

(async () => {
  try {
    const { stdout } = await execa('now');
    const alisaExec = execa('now', ['alias', stdout, `${alias[0]}.now.sh`]);
    alisaExec.stdout.pipe(process.stdout);
    alisaExec.stderr.pipe(process.stderr);
  } catch (e) {
    console.log(e.stderr);
  }
})();
