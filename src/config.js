const MAX_RETRY = 20;
const RETRY_INTERVAL = 30 * 1000;

const SIZE_STORE_ENDPOINT =
  process.env.SIZE_STORE_ENDPOINT || "https://size-store.now.sh";

const BOT = "size-plugin[bot]";

const STAR_REPO_MESSAGE = `


#### like it?
⭐️ [me](https://github.com/kuldeepkeshwar/size-plugin-bot) 😊
`;

module.exports = {
  MAX_RETRY,
  RETRY_INTERVAL,
  SIZE_STORE_ENDPOINT,
  STAR_REPO_MESSAGE,
  BOT
};
