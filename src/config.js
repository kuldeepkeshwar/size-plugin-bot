const MAX_RETRY = 20;
const RETRY_INTERVAL = 30 * 1000;

const SIZE_STORE_ENDPOINT =
	process.env.SIZE_STORE_ENDPOINT || 'https://size-plugin-store.now.sh';

module.exports = { MAX_RETRY, RETRY_INTERVAL, SIZE_STORE_ENDPOINT };
