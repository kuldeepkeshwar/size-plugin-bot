#!/usr/bin/env node
require('dotenv').config()

const execa = require('execa');
const secrets = {
    "app-id": process.env.APP_ID,
    "webhook-secret": process.env.WEBHOOK_SECRET,
    // "private-key-base64-encoded": process.env.PRIVATE_KEY
};

(async () => {
    try{
        const keys= Object.keys(secrets);
        for (const key of keys) {
            const cmd=`now secret add ${key} ${secrets[key]}`;
            console.log(cmd);
            await execa.shell(cmd);
        }
    }catch(e){
        console.log(e.stderr);
    }
})();
