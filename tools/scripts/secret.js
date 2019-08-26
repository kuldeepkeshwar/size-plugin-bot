#!/usr/bin/env node
require('dotenv').config()

const execa = require('execa')

const secrets = {
    'size-plugin-bot-app-id': process.env.APP_ID,
    'size-plugin-bot-webhook-secret': process.env.WEBHOOK_SECRET,
    'size-plugin-bot-private-key-base64-encoded': process.env.PRIVATE_KEY,
}

;(async () => {
    try {
        const keys = Object.keys(secrets)
        for (const key of keys) {
            const cmd = `now secret add ${key} ${secrets[key]}`
            console.log(cmd)
            await execa.shell(cmd)
        }
    } catch (e) {
        console.log(e.stderr)
    }
})()
