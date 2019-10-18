const getConfig = require("probot-config");

function toMap(arr, propertyname) {
  return arr.reduce((agg, item) => {
    const property = item[propertyname];
    // eslint-disable-next-line no-param-reassign
    agg[property] = item;
    return agg;
  }, {});
}
async function getBotConfig(context) {
  const botConfig = await getConfig(context, "size-plugin.yml");
  return {
    "size-files": ["size-plugin.json"],
    "base-branches": ["master"],
    ...botConfig
  };
}

async function getFileFromConfig(context) {
  const botConfig = await getBotConfig(context);
  const sizefilepaths = botConfig["size-files"].map(filename => ({
    filename,
    commented: false
  }));
  return sizefilepaths;
}
module.exports = { toMap, getBotConfig };
