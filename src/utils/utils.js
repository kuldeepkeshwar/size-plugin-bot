const getConfig = require('probot-config');

function toMap(arr, propertyname) {
  return arr.reduce((agg, item) => {
    const property = item[propertyname];
    // eslint-disable-next-line no-param-reassign
    agg[property] = item;
    return agg;
  }, {});
}
async function getBotConfig(context) {
  const botConfig = await getConfig(context, 'size-plugin.yml');
  return {
    'size-files': ['size-plugin.json'],
    'base-branches': ['master'],
    ...botConfig,
  };
}

module.exports = { toMap, getBotConfig };
